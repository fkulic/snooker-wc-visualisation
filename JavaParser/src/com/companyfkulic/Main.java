package com.companyfkulic;

import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class Main {

    public static void main(String[] args) {
        String baseUrl = "http://api.snooker.org/";
        GetJsonData getJsonData = new GetJsonData(baseUrl);

        Map<String, String> events = new HashMap<>();
        events.put("wc2013", "224");
        events.put("wc2014", "297");
        events.put("wc2015", "367");
        events.put("wc2016", "416");
        events.put("wc2017", "536");
        for (String key : events.keySet()) {
            String jsonMatches = getJsonData.getJson("t=6&e=" + events.get(key));
            String jsonPlayers = getJsonData.getJson("t=9&e=" + events.get(key));

            ParseForVis parseForVis = new ParseForVis(jsonMatches, jsonPlayers);
            String jsonForVis = parseForVis.getJson();

            String fileLocation = "../d3/json-data/" + key + ".json";
            try (FileWriter fw = new FileWriter(fileLocation)) {
                fw.write(jsonForVis);
                System.out.println(key + ".json successfully created.");
                fw.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
