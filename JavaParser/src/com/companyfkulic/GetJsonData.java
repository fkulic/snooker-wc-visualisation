package com.companyfkulic;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Created by filip on 16.5.2017..
 */
public class GetJsonData {
    String baseURL;

    public GetJsonData(String baseURL) {
        this.baseURL = baseURL + "?";
    }

    public String getJson(String params) {
        StringBuilder sb = new StringBuilder();
        try {
            URL url = new URL(baseURL + params);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");

            BufferedReader inM = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String line;
            while ((line = inM.readLine()) != null) {
                sb.append(line);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return sb.toString();
    }
}
