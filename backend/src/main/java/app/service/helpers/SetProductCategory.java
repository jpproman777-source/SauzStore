package app.service.helpers;

import app.domain.enums.CategoryEnum;
import app.service.validations.FormTypeValidator;

public class SetProductCategory {
    private SetProductCategory() {
    }

    public static String getCategory() {
        while (true) {
            int option = FormTypeValidator.intValidator(
                    "Seleccione la categoría del producto:\n1. Tops\n2. Bottoms\n3. Dresses\n4. Outerwear\n5. Accessories");
            switch (option) {
                case 1:
                    return CategoryEnum.TOPS.getValue();
                case 2:
                    return CategoryEnum.BOTTOMS.getValue();
                case 3:
                    return CategoryEnum.DRESSES.getValue();
                case 4:
                    return CategoryEnum.OUTERWEAR.getValue();
                case 5:
                    return CategoryEnum.ACCESSORIES.getValue();
                default:
                    System.out.println("Opción inválida. Intente nuevamente.");
            }
        }
    }
}
