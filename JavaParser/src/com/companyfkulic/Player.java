package com.companyfkulic;

/**
 * Created by filip on 13.5.2017..
 */
public class Player {
    public int ID;
    public String FirstName;
    public String LastName;
    public String Nationality;
    public String Photo;

    public String getName() {
        return this.FirstName + " " + this.LastName;
    }
}
