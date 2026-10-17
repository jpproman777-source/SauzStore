package app.repository;

import app.domain.Product;
import app.service.outputport.ProductRepository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class ProductRepositoryImpl implements ProductRepository {
    private final List<Product> products = new ArrayList<>();

    @Override
    public Product saveProduct(Product product) {
        products.add(product);
        return product;
    }

    @Override
    public List<Product> selectAllProducts() {
        return Collections.unmodifiableList(new ArrayList<>(products));
    }

    @Override
    public Product selectProductById(int id) {
        for (Product product : products) {
            if (product.getId() == id) {
                return product;
            }
        }
        return null;
    }

    @Override
    public Product updateProduct(Product updatedProduct) {
        for (int i = 0; i < products.size(); i++) {
            if (products.get(i).getId() == updatedProduct.getId()) {
                products.set(i, updatedProduct);
                return updatedProduct;
            }
        }
        return null;
    }

    @Override
    public void deleteProduct(int id) {
        products.removeIf(product -> product.getId() == id);
    }
}
