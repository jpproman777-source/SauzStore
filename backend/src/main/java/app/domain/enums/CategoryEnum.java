package app.domain.enums;

public enum CategoryEnum {
    TOPS("Tops"),
    BOTTOMS("Bottoms"),
    DRESSES("Dresses"),
    OUTERWEAR("Outerwear"),
    ACCESSORIES("Accessories");

    private final String value;

    CategoryEnum(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
