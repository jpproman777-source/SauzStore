package app.view;

import app.domain.Customer;
import app.service.inputport.CustomerService;
import app.service.validations.FormTypeValidator;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

public class CustomerView {
    private final CustomerService customerService;

    public CustomerView(CustomerService customerService) {
        this.customerService = customerService;
    }

    public void createCustomer() {
        int id = FormTypeValidator.intValidator("Ingrese el ID del cliente");
        String docType = FormTypeValidator.stringValidator("Ingrese el tipo de documento del cliente");
        String name = FormTypeValidator.stringValidator("Ingrese el nombre del cliente");
        String lastName = FormTypeValidator.stringValidator("Ingrese el apellido del cliente");
        String phone = FormTypeValidator.stringValidator("Ingrese el teléfono del cliente");
        String email = FormTypeValidator.stringValidator("Ingrese el correo electrónico del cliente");
        String address = FormTypeValidator.stringValidator("Ingrese la dirección del cliente");
        String password = FormTypeValidator.stringValidator("Ingrese la contraseña del cliente");
        Date birthDate = getBirthDateFromInput();
        String customerType = FormTypeValidator.stringValidator("Ingrese el tipo de cliente (Premium, Regular, VIP)");

        try {
            customerService.createCustomer(id, docType, name, lastName, phone, email, address, password, birthDate, customerType);
            System.out.println("Cliente registrado correctamente.");
        } catch (IllegalArgumentException e) {
            System.out.println("No se pudo registrar el cliente: " + e.getMessage());
        }
    }

    public void showAllCustomers() {
        List<Customer> customers = customerService.selectAllCustomers();
        if (customers.isEmpty()) {
            System.out.println("No hay clientes registrados.");
            return;
        }

        System.out.println("\n--- LISTA DE CLIENTES ---");
        for (Customer customer : customers) {
            System.out.println("ID: " + customer.getId()
                    + " | Nombre: " + customer.getName() + " " + customer.getLastName()
                    + " | Documento: " + customer.getDocType()
                    + " | Correo: " + customer.getEmail()
                    + " | Tipo: " + customer.getCustomerType());
        }
    }

    public Date getBirthDateFromInput() {
        while (true) {
            String birthDateString = FormTypeValidator.stringValidator(
                    "Ingrese la fecha de nacimiento del cliente (formato: yyyy-MM-dd)");
            try {
                return Date.from(LocalDate.parse(birthDateString).atStartOfDay(ZoneId.systemDefault()).toInstant());
            } catch (DateTimeParseException e) {
                System.out.println("Fecha inválida. Use el formato yyyy-MM-dd e ingrese una fecha real.");
            }
        }
    }
}
