package app.service;

import app.domain.Customer;
import app.domain.Product;
import app.domain.Sale;
import app.domain.SaleItem;
import app.service.inputport.SaleService;
import app.service.outputport.CustomerRepository;
import app.service.outputport.ProductRepository;
import app.service.outputport.SaleRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class SaleServiceImpl implements SaleService {
    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public SaleServiceImpl(SaleRepository saleRepository, CustomerRepository customerRepository,
                           ProductRepository productRepository) {
        this.saleRepository = saleRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    @Override
    public Sale createSale(int id, int customerId, Map<Integer, Integer> productQuantities) {
        if (id <= 0) {
            throw new IllegalArgumentException("El ID de la venta debe ser mayor que cero.");
        }
        if (saleRepository.selectSaleById(id) != null) {
            throw new IllegalArgumentException("Ya existe una venta con ese ID.");
        }
        if (productQuantities == null) {
            throw new IllegalArgumentException("Debe indicar los productos de la venta.");
        }
        Customer customer = customerRepository.selectCustomerById(customerId);
        if (customer == null) {
            throw new IllegalArgumentException("No existe un cliente con ese ID.");
        }
        if (productQuantities.isEmpty()) {
            throw new IllegalArgumentException("La venta debe incluir al menos un producto.");
        }

        List<SaleItem> items = new ArrayList<>();
        List<Product> products = new ArrayList<>();
        for (Map.Entry<Integer, Integer> entry : productQuantities.entrySet()) {
            if (entry.getKey() == null || entry.getValue() == null) {
                throw new IllegalArgumentException("Los IDs de producto y las cantidades son obligatorios.");
            }
            int quantity = entry.getValue();
            if (quantity <= 0) {
                throw new IllegalArgumentException("La cantidad debe ser mayor que cero.");
            }
            Product product = productRepository.selectProductById(entry.getKey());
            if (product == null) {
                throw new IllegalArgumentException("No existe un producto con ID " + entry.getKey() + ".");
            }
            if (product.getStock() < quantity) {
                throw new IllegalArgumentException("Stock insuficiente para " + product.getName()
                        + ". Disponible: " + product.getStock() + ".");
            }
            if (!Double.isFinite(product.getPrice()) || product.getPrice() < 0) {
                throw new IllegalArgumentException("El producto " + product.getName() + " tiene un precio inválido.");
            }
            products.add(product);
            items.add(new SaleItem(product.getId(), product.getName(), quantity, product.getPrice()));
        }

        for (int i = 0; i < products.size(); i++) {
            Product product = products.get(i);
            product.setStock(product.getStock() - productQuantities.get(product.getId()));
            productRepository.updateProduct(product);
        }

        Sale sale = new Sale(id, customerId, LocalDateTime.now(), items);
        return saleRepository.saveSale(sale);
    }

    @Override
    public Sale selectSaleById(int id) {
        return saleRepository.selectSaleById(id);
    }

    @Override
    public List<Sale> selectAllSales() {
        return saleRepository.selectAllSales();
    }
}
