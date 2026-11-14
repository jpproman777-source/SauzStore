package app.domain;

import java.util.Date;

public class Customer extends Person {
    public Customer() {
    }

    public Customer(int id, String docType, String name, String lastName, String phone, String email, String address, String password, Date birthDate) {
        super(id, docType, name, lastName, phone, email, address, password, birthDate);
    }
}
