package app.service.outputport;

import app.domain.Sale;

import java.util.List;

public interface SaleRepository {
    Sale saveSale(Sale sale);
    Sale selectSaleById(int id);
    List<Sale> selectAllSales();
}
