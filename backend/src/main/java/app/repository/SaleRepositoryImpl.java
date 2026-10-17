package app.repository;

import app.domain.Sale;
import app.service.outputport.SaleRepository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class SaleRepositoryImpl implements SaleRepository {
    private final List<Sale> sales = new ArrayList<>();

    @Override
    public Sale saveSale(Sale sale) {
        sales.add(sale);
        return sale;
    }

    @Override
    public Sale selectSaleById(int id) {
        for (Sale sale : sales) {
            if (sale.getId() == id) {
                return sale;
            }
        }
        return null;
    }

    @Override
    public List<Sale> selectAllSales() {
        return Collections.unmodifiableList(new ArrayList<>(sales));
    }
}
