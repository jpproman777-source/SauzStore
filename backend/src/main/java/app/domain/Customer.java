package app.domain;

import java.util.Date;

public class Customer extends Person {
    private String customerType;

    public Customer() {
    }

    public Customer(int id, String docType, String name, String lastName, String phone, String email, String address, String password, Date birthDate, String customerType) {
        super(id, docType, name, lastName, phone, email, address, password, birthDate);
        this.customerType = customerType;
    }

    public String getCustomerType() {
        return customerType;
    }

    public void setCustomerType(String customerType) {
        this.customerType = customerType;
    }

}
