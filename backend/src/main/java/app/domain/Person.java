package app.domain;

import java.util.Date;

public class Person {
    private int id;
    private String docType;
    private String name;
    private String lastName;
    private String phone;
    private String email;
    private String address;
    private String password;
    private Date birthDate;

    public Person() {
    }

    public Person(int id, String docType, String name, String lastName, String phone, String email, String address, String password, Date birthDate) {
        this.id = id;
        this.docType = docType;
        this.name = name;
        this.lastName = lastName;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.password = password;
        this.birthDate = birthDate;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getDocType() {
        return docType;
    }

    public void setDocType(String docType) {
        this.docType = docType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Date getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(Date birthDate) {
        this.birthDate = birthDate;
    }

}
