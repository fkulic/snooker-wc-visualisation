package com.companyfkulic;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.util.ArrayList;
import java.util.Arrays;

/**
 * Created by filip on 16.5.2017..
 */
public class ParseForVis {
    private String json;

    public ParseForVis(String jsonMatches, String jsonPlayers) {
        this.json = parse(jsonMatches, jsonPlayers);
    }

    public String getJson() {
        return json;
    }

    private String parse(String jsonMatches, String jsonPlayers) {
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
        return  gson.toJson(json);
    }
}
