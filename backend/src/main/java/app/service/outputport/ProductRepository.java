package app.service.outputport;

import app.domain.Product;

import java.util.List;

public interface ProductRepository {
    Product saveProduct(Product product);
    List<Product> selectAllProducts();
    Product selectProductById(int id);
    Product updateProduct(Product product);
    void deleteProduct(int id);
}
