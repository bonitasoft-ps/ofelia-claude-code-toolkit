package com.example.bonita.tests;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/** Minimal client for the MailPit REST API: the test mailbox every process mail lands in. */
final class MailPit {

    record Mail(String id, String subject, String html, String text) {}

    private static final String URL = System.getProperty("mailpit.url", "http://localhost:8025");
    private static final HttpClient HTTP = HttpClient.newHttpClient();
    private static final ObjectMapper JSON = new ObjectMapper();

    private MailPit() {}

    static List<Mail> mailsTo(String address) {
        JsonNode found = get("/api/v1/search?query=" + URLEncoder.encode("to:\"" + address + "\"", StandardCharsets.UTF_8));
        List<Mail> mails = new ArrayList<>();
        for (JsonNode summary : found.path("messages")) {
            JsonNode full = get("/api/v1/message/" + summary.path("ID").asText());
            mails.add(new Mail(full.path("ID").asText(), full.path("Subject").asText(),
                    full.path("HTML").asText(), full.path("Text").asText()));
        }
        return mails;
    }

    private static JsonNode get(String path) {
        try {
            HttpResponse<String> r = HTTP.send(HttpRequest.newBuilder(URI.create(URL + path)).GET().build(),
                    HttpResponse.BodyHandlers.ofString());
            if (r.statusCode() != 200) {
                throw new IllegalStateException("MailPit " + path + " -> HTTP " + r.statusCode());
            }
            return JSON.readTree(r.body());
        } catch (java.io.IOException e) {
            throw new IllegalStateException("MailPit not reachable at " + URL, e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while calling MailPit", e);
        }
    }
}
