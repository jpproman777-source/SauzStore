package app.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Sale {
    private final int id;
    private final int customerId;
    private final LocalDateTime date;
    private final List<SaleItem> items;

    public Sale(int id, int customerId, LocalDateTime date, List<SaleItem> items) {
        this.id = id;
        this.customerId = customerId;
        this.date = date;
        this.items = new ArrayList<>(items);
    }

    public int getId() {
        return id;
    }

    public int getCustomerId() {
        return customerId;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public List<SaleItem> getItems() {
        return Collections.unmodifiableList(items);
    }

    public double getTotal() {
        return items.stream().mapToDouble(SaleItem::getSubtotal).sum();
    }
}
