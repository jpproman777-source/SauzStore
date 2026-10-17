package app.service.helpers;

import app.domain.enums.SizeEnum;
import app.service.validations.FormTypeValidator;

public class SetProductSize {
    private SetProductSize() {
    }

    public static String getSize() {
        while (true) {
            int option = FormTypeValidator.intValidator("Seleccione la talla:\n1. XS\n2. S\n3. M\n4. L\n5. XL");
            switch (option) {
                case 1:
                    return SizeEnum.XS.getValue();
                case 2:
                    return SizeEnum.S.getValue();
                case 3:
                    return SizeEnum.M.getValue();
                case 4:
                    return SizeEnum.L.getValue();
                case 5:
                    return SizeEnum.XL.getValue();
                default:
                    System.out.println("Opción inválida. Intente nuevamente.");
            }
        }
    }
}
