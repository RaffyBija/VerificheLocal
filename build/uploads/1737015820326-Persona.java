package es0oop;

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

/**
 *
 * @author contesinit
 */
public class Persona {
    
    //Attributi
    private String nome;
    private String cognome;
    private double peso; //kg
    private int altezza; //cm


    
    //Metodi
    public Persona(String nome, String cognome, double peso, int altezza){
        this.nome = nome;
        this.cognome = cognome;
        this.peso = peso;
        this.altezza = altezza;
    }
    public String getNome(){
        return nome;
    }
    public String getCognome(){
        return cognome;
    }
    public double getPeso(){
        return peso;
    }
    public int getAltezza(){
        return altezza;
    }
    public  void setNome(String nome){
        if(nome==null || nome.isEmpty())
            throw new IllegalArgumentException("Errore: nome Vuoto");
        
        this.nome=nome;
        
    }
    public  void setCognome(String cognome){
        if(cognome==null || cognome.isEmpty())
            throw new IllegalArgumentException("Errore: cognome Vuoto");
        
        this.cognome=cognome;
        
    }
    public  void setPeso(double peso){
        if(peso<0)
            throw new IllegalArgumentException("Errore: peso Vuoto");
        
        this.peso=peso;
        
    }
    public  void setAltezza(int altezza){
        if(altezza<0)
            throw new IllegalArgumentException("Errore: alòtezza Vuoto");
        this.altezza=altezza;
        
    }
    
    
    
    
}
