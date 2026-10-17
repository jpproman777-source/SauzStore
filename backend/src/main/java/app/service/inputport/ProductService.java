package app.service.inputport;

import app.domain.Product;

import java.util.List;

public interface ProductService {
    Product createProduct(int id, String name, String category, String size, String color, double price, int stock);
    Product selectProductById(int id);
    List<Product> selectAllProducts();
    Product updateProduct(int id, String name, String category, String size, String color, double price, int stock);
    void deleteProduct(int id);
}
