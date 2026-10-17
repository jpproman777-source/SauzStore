package app.domain.enums;

public enum SizeEnum {
    XS("XS"),
    S("S"),
    M("M"),
    L("L"),
    XL("XL");

    private final String value;

    SizeEnum(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
