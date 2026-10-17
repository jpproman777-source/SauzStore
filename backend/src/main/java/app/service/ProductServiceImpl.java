package app.service;

import app.domain.Product;
import app.service.inputport.ProductService;
import app.service.outputport.ProductRepository;

import java.util.List;

public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public Product createProduct(int id, String name, String category, String size, String color, double price, int stock) {
        validateProduct(id, name, price, stock);
        if (productRepository.selectProductById(id) != null) {
            throw new IllegalArgumentException("Ya existe un producto con ese ID.");
        }
        Product product = new Product(id, name, category, size, color, price, stock);
        return productRepository.saveProduct(product);
    }

    @Override
    public Product selectProductById(int id) {
        return productRepository.selectProductById(id);
    }

    @Override
    public List<Product> selectAllProducts() {
        return productRepository.selectAllProducts();
    }

    @Override
    public Product updateProduct(int id, String name, String category, String size, String color, double price, int stock) {
        validateProduct(id, name, price, stock);
        Product product = new Product(id, name, category, size, color, price, stock);
        return productRepository.updateProduct(product);
    }

    @Override
    public void deleteProduct(int id) {
        productRepository.deleteProduct(id);
    }

    private void validateProduct(int id, String name, double price, int stock) {
        if (id <= 0) {
            throw new IllegalArgumentException("El ID del producto debe ser mayor que cero.");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("El nombre del producto no puede estar vacío.");
        }
        if (!Double.isFinite(price) || price < 0) {
            throw new IllegalArgumentException("El precio debe ser un número válido y no negativo.");
        }
        if (stock < 0) {
            throw new IllegalArgumentException("El stock no puede ser negativo.");
        }
    }
}
