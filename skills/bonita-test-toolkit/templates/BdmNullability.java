import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Bonita's BDM update adds new columns but never relaxes an existing NOT NULL. A field that became
 * optional in bom.xml stays mandatory in the database and every insert without it fails.
 * This lists (and with --apply, fixes) the columns that are NOT NULL in H2 but nullable in bom.xml.
 *
 * The server MUST be stopped: embedded H2 allows one connection. Back up the H2 first.
 *
 * Usage (single-file Java, the H2 jar from the bundle on the classpath):
 *   java -cp <bundle>/server/lib/bonita/h2-1.4.200.jar BdmNullability.java <bundleDir> <bom.xml> [--apply]
 * The database password is read from <bundleDir>/setup/database.properties, never from the command line.
 */
public class BdmNullability {

    public static void main(String[] args) throws Exception {
        Path bundle = Path.of(args[0]);
        String bom = Files.readString(Path.of(args[1]));
        boolean apply = args.length > 2 && args[2].equals("--apply");

        Properties db = new Properties();
        try (var in = Files.newInputStream(bundle.resolve("setup/database.properties"))) {
            db.load(in);
        }
        String url = "jdbc:h2:file:" + bundle.resolve("h2_database").resolve(db.getProperty("bdm.db.database.name")).toAbsolutePath()
                + ";IFEXISTS=TRUE";

        List<String[]> nullable = new ArrayList<>();
        Matcher object = Pattern.compile("<businessObject qualifiedName=\"[^\"]*?\\.([A-Za-z0-9_]+)\"[\\s\\S]*?</businessObject>").matcher(bom);
        while (object.find()) {
            Matcher field = Pattern.compile("<field type=\"[A-Z_]+\"[^>]*name=\"([A-Za-z0-9_]+)\" nullable=\"true\" collection=\"false\"").matcher(object.group());
            while (field.find()) {
                nullable.add(new String[] {object.group(1).toUpperCase(), field.group(1).toUpperCase()});
            }
        }

        int found = 0;
        try (Connection c = DriverManager.getConnection(url, db.getProperty("bdm.db.user"), db.getProperty("bdm.db.password", ""))) {
            for (String[] tc : nullable) {
                try (var ps = c.prepareStatement("SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME = ?")) {
                    ps.setString(1, tc[0]);
                    ps.setString(2, tc[1]);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next() && "NO".equals(rs.getString(1))) {
                            found++;
                            System.out.println((apply ? "[fix] " : "[NOT NULL] ") + tc[0] + "." + tc[1]);
                            if (apply) {
                                try (var st = c.createStatement()) {
                                    st.execute("ALTER TABLE " + tc[0] + " ALTER COLUMN " + tc[1] + " SET NULL");
                                }
                            }
                        }
                    }
                }
            }
        }
        System.out.println(found + " column(s) NOT NULL in the database but nullable in bom.xml" + (apply ? ", relaxed." : "."));
    }
}
