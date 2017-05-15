package com.companyfkulic;


import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;

public class Main {

    public static void main(String[] args) {
        String urlM = "../wc2017matches.json";
        String urlP = "../playerswc2017.json";
        File fMatches = new File(urlM);
        File fPlayers = new File(urlP);
        byte[] jsonM = new byte[(int) fMatches.length()];
        byte[] jsonP = new byte[(int) fPlayers.length()];
        try (FileInputStream f1 = new FileInputStream(fMatches);
             FileInputStream f2 = new FileInputStream(fPlayers)) {
            f1.read(jsonM);
            f1.close();
            f2.read(jsonP);
            f2.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        String jsonMatches = new String(jsonM);
        String jsonPlayers = new String(jsonP);

        Gson gson = new Gson();

        Match[] matches = gson.fromJson(jsonMatches, Match[].class);
        Arrays.sort(matches);
        Player[] players = gson.fromJson(jsonPlayers, Player[].class);


        winners json = new winners();

        ArrayList<winners> round7 = new ArrayList<>();
        ArrayList<winners> round8 = new ArrayList<>();
        ArrayList<winners> round13 = new ArrayList<>();
        ArrayList<winners> round14 = new ArrayList<>();
        ArrayList<winners> round15 = new ArrayList<>();

        int round = matches[0].Round;
        int matchesInRound = 1;
        int j = 1;
        for (Match match: matches) {
            boolean hasWinners;
            if (match.Round != round) {
                round = match.Round;
                matchesInRound *= 2;
            }

            if (j <= matchesInRound / 2) {
                hasWinners = true;
            } else {
                hasWinners = false;
            }

            for (Player player : players) {
                if (match.Player1ID == player.ID) {
                    match.player1 = player;
                } else if (match.Player2ID == player.ID) {
                    match.player2 = player;
                }
            }

            switch (match.Round) {
                case 15:
                    round15.add(new winners(match.player1.getName(), true));
                    round15.add(new winners(match.player2.getName(), false));
                    break;

                case 14:
                    round14.add(new winners(match.player1.getName(), hasWinners));
                    round14.add(new winners(match.player2.getName(), hasWinners));
                    break;

                case 13:
                    round13.add(new winners(match.player1.getName(), hasWinners));
                    round13.add(new winners(match.player2.getName(), hasWinners));
                    break;

                case 8:
                    round8.add(new winners(match.player1.getName(), hasWinners));
                    round8.add(new winners(match.player2.getName(), hasWinners));
                    break;

                case 7:
                    round7.add(new winners(match.player1.getName()));
                    round7.add(new winners(match.player2.getName()));
                    break;
            }

            j = matchesInRound == 0 ? 0 : j % (matchesInRound) + 1;
        }

        if (matches[0].WinnerID == matches[0].player1.ID) {
            json.name = matches[0].player1.getName();
        } else {
            json.name = matches[0].player2.getName();
        }

        for (int i = 0 ; i < round8.size(); i++) {
            if (i < round8.size() / 2) {
                round8.get(i).winners.add(round7.get(i*2));
                round8.get(i).winners.add(round7.get(i*2+1));
            } else {
                round8.get(i).challengers.add(round7.get(i*2));
                round8.get(i).challengers.add(round7.get(i*2+1));
            }
        }

        for (int i = 0 ; i < round13.size(); i++) {
            if (i < round13.size() / 2) {
                round13.get(i).winners.add(round8.get(i*2));
                round13.get(i).winners.add(round8.get(i*2+1));
            } else {
                round13.get(i).challengers.add(round8.get(i*2));
                round13.get(i).challengers.add(round8.get(i*2+1));
            }
        }

        for (int i = 0 ; i < round14.size(); i++) {
            if (i < round14.size() / 2) {
                round14.get(i).winners.add(round13.get(i*2));
                round14.get(i).winners.add(round13.get(i*2+1));
            } else {
                round14.get(i).challengers.add(round13.get(i*2));
                round14.get(i).challengers.add(round13.get(i*2+1));
            }
        }

        for (int i = 0 ; i < round15.size(); i++) {
            if (i < round15.size() / 2) {
                round15.get(i).winners.add(round14.get(i*2));
                round15.get(i).winners.add(round14.get(i*2+1));
            } else {
                round15.get(i).challengers.add(round14.get(i*2));
                round15.get(i).challengers.add(round14.get(i*2+1));
            }
        }

        json.winners.add(round15.get(0));
        json.challengers.add(round15.get(1));

        gson = new GsonBuilder().setPrettyPrinting().create();
        String jsonMatch = gson.toJson(json);
        System.out.println(jsonMatch);

        try (FileWriter fw = new FileWriter("../d3/2017m.json")) {
            fw.write(jsonMatch);
            fw.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
