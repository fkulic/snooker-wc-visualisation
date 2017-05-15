package com.companyfkulic;

/**
 * Created by filip on 13.5.2017..
 */
public class Match implements Comparable<Match> {
    public int Round;
    public int Number;
    public int Player1ID;
    public int Score1;
    public int Player2ID;
    public int Score2;
    public int WinnerID;

    Player player1;
    Player player2;

    @Override
    public int compareTo(Match o) {
        if (this.Round > o.Round) {
            return -1;
        } else if (this.Round < o.Round) {
            return 1;
        }
        return 0;
    }
}
