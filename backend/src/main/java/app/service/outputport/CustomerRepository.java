package app.service.outputport;

import app.domain.Customer;

import java.util.List;

public interface CustomerRepository {
    Customer saveCustomer(Customer customer);
    List<Customer> selectAllCustomers();
    Customer selectCustomerById(int id);
    Customer updateCustomer(Customer customer);
    void deleteCustomer(int id);
}
