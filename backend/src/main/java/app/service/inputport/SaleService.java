package app.service.inputport;

import app.domain.Sale;

import java.util.List;
import java.util.Map;

public interface SaleService {
    Sale createSale(int id, int customerId, Map<Integer, Integer> productQuantities);
    Sale selectSaleById(int id);
    List<Sale> selectAllSales();
}
