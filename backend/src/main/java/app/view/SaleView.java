package app.view;

import app.domain.Sale;
import app.domain.SaleItem;
import app.service.inputport.SaleService;
import app.service.validations.FormTypeValidator;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class SaleView {
    private final SaleService saleService;

    public SaleView(SaleService saleService) {
        this.saleService = saleService;
    }

    public void createSale() {
        int id = FormTypeValidator.intValidator("Ingrese el ID de la venta");
        int customerId = FormTypeValidator.intValidator("Ingrese el ID del cliente");
        int numberOfProducts = FormTypeValidator.intValidator("¿Cuántos productos diferentes incluye la venta?");
        if (numberOfProducts <= 0) {
            System.out.println("La venta debe incluir al menos un producto.");
            return;
        }

        Map<Integer, Integer> quantities = new LinkedHashMap<>();
        for (int i = 0; i < numberOfProducts; i++) {
            int productId = FormTypeValidator.intValidator("Ingrese el ID del producto " + (i + 1));
            int quantity = FormTypeValidator.intValidator("Ingrese la cantidad");
            if (quantities.put(productId, quantity) != null) {
                System.out.println("No repita productos en la misma venta.");
                return;
            }
        }

        try {
            Sale sale = saleService.createSale(id, customerId, quantities);
            System.out.println("Venta registrada correctamente. Total: " + sale.getTotal());
        } catch (IllegalArgumentException e) {
            System.out.println("No se pudo registrar la venta: " + e.getMessage());
        }
    }

    public void showAllSales() {
        List<Sale> sales = saleService.selectAllSales();
        if (sales.isEmpty()) {
            System.out.println("No hay ventas registradas.");
            return;
        }

        System.out.println("\n--- LISTA DE VENTAS ---");
        for (Sale sale : sales) {
            System.out.println("Venta: " + sale.getId()
                    + " | Cliente: " + sale.getCustomerId()
                    + " | Fecha: " + sale.getDate()
                    + " | Total: " + sale.getTotal());
            for (SaleItem item : sale.getItems()) {
                System.out.println("  Producto: " + item.getProductName()
                        + " | Cantidad: " + item.getQuantity()
                        + " | Precio unitario: " + item.getUnitPrice()
                        + " | Subtotal: " + item.getSubtotal());
            }
        }
    }
}
