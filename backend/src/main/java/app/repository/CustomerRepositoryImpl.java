package app.repository;

import app.domain.Customer;
import app.service.outputport.CustomerRepository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CustomerRepositoryImpl implements CustomerRepository {
    private final List<Customer> customers = new ArrayList<>();

    @Override
    public Customer saveCustomer(Customer customer) {
        customers.add(customer);
        return customer;
    }

    @Override
    public List<Customer> selectAllCustomers() {
        return Collections.unmodifiableList(new ArrayList<>(customers));
    }

    @Override
    public Customer selectCustomerById(int id) {
        for (Customer customer : customers) {
            if (customer.getId() == id) {
                return customer;
            }
        }
        return null;
    }

    @Override
    public Customer updateCustomer(Customer customer) {
        for (int i = 0; i < customers.size(); i++) {
            if (customers.get(i).getId() == customer.getId()) {
                customers.set(i, customer);
                return customer;
            }
        }
        return null;
    }

    @Override
    public void deleteCustomer(int id) {
        customers.removeIf(customer -> customer.getId() == id);
    }
}
