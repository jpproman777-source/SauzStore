package app.service.inputport;

import app.domain.Customer;

import java.util.Date;
import java.util.List;

public interface CustomerService {
    Customer createCustomer(int id, String docType, String name, String lastName, String phone, String email, String address, String password, Date birthDate, String customerType);
    Customer selectCustomerById(int id);
    List<Customer> selectAllCustomers();
    Customer updateCustomer(int id, String docType, String name, String lastName, String phone, String email, String address, String password, Date birthDate, String customerType);
    void deleteCustomer(int id);
}
