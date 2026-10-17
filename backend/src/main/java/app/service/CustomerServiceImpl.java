package app.service;

import app.domain.Customer;
import app.service.inputport.CustomerService;
import app.service.outputport.CustomerRepository;

import java.util.Date;
import java.util.List;

public class CustomerServiceImpl implements CustomerService {
    private final CustomerRepository customerRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public Customer createCustomer(int id, String docType, String name, String lastName, String phone, String email, String address, String password, Date birthDate, String customerType) {
        if (id <= 0) {
            throw new IllegalArgumentException("El ID del cliente debe ser mayor que cero.");
        }
        if (customerRepository.selectCustomerById(id) != null) {
            throw new IllegalArgumentException("Ya existe un cliente con ese ID.");
        }
        Customer customer = new Customer(id, docType, name, lastName, phone, email, address, password, birthDate, customerType);
        return customerRepository.saveCustomer(customer);
    }

    @Override
    public Customer selectCustomerById(int id) {
        return customerRepository.selectCustomerById(id);
    }

    @Override
    public List<Customer> selectAllCustomers() {
        return customerRepository.selectAllCustomers();
    }

    @Override
    public Customer updateCustomer(int id, String docType, String name, String lastName, String phone, String email, String address, String password, Date birthDate, String customerType) {
        Customer customer = new Customer(id, docType, name, lastName, phone, email, address, password, birthDate, customerType);
        return customerRepository.updateCustomer(customer);
    }

    @Override
    public void deleteCustomer(int id) {
        customerRepository.deleteCustomer(id);
    }
}
