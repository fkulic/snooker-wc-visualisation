package com.companyfkulic;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by filip on 14.5.2017..
 */
public class winners {
    public String name;
    public Integer score;
    public List<winners> winners;
    public List<winners> challengers;

    public winners() {
        this.winners = new ArrayList<>();
        this.challengers = new ArrayList<>();
    }

    public winners(String name, int score) {
        this.name = name;
        this.score = score;
    }

    public winners(String name, int score, boolean hasWinners) {
        this.name = name;
        this.score = score;
        if (hasWinners) {
            this.winners = new ArrayList<>();
        } else {

            this.challengers = new ArrayList<>();
        }
    }

}
