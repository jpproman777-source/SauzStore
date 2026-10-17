package app.view;

import app.domain.Product;
import app.service.helpers.SetProductCategory;
import app.service.helpers.SetProductSize;
import app.service.inputport.ProductService;
import app.service.validations.FormTypeValidator;

import java.util.List;

public class ProductView {
    private final ProductService productService;

    public ProductView(ProductService productService) {
        this.productService = productService;
    }

    public void createProduct() {
        int id = FormTypeValidator.intValidator("Ingrese el ID del producto");
        String name = FormTypeValidator.stringValidator("Ingrese el nombre del producto");
        String category = SetProductCategory.getCategory();
        String size = SetProductSize.getSize();
        String color = FormTypeValidator.stringValidator("Ingrese el color del producto");
        double price = FormTypeValidator.doubleValidator("Ingrese el precio del producto");
        int stock = FormTypeValidator.intValidator("Ingrese la cantidad en stock");

        try {
            productService.createProduct(id, name, category, size, color, price, stock);
            System.out.println("Producto registrado correctamente.");
        } catch (IllegalArgumentException e) {
            System.out.println("No se pudo registrar el producto: " + e.getMessage());
        }
    }

    public void showAllProducts() {
        List<Product> products = productService.selectAllProducts();
        if (products.isEmpty()) {
            System.out.println("No hay productos registrados.");
            return;
        }

        System.out.println("\n--- LISTA DE PRODUCTOS ---");
        for (Product product : products) {
            System.out.println("ID: " + product.getId()
                    + " | Nombre: " + product.getName()
                    + " | Categoría: " + product.getCategory()
                    + " | Talla: " + product.getSize()
                    + " | Color: " + product.getColor()
                    + " | Precio: " + product.getPrice()
                    + " | Stock: " + product.getStock());
        }
    }
}
