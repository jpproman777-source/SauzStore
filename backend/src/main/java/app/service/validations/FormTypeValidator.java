package app.service.validations;

import java.util.InputMismatchException;
import java.util.Scanner;

public class FormTypeValidator {
    private static final Scanner sc = new Scanner(System.in);

    private FormTypeValidator() {
    }

    public static int intValidator(String prompt) {
        while (true) {
            try {
                System.out.println(prompt);
                int value = sc.nextInt();
                sc.nextLine();
                return value;
            } catch (InputMismatchException e) {
                System.out.println("Solo se admiten números enteros");
                sc.nextLine();
            }
        }
    }

    public static double doubleValidator(String prompt) {
        while (true) {
            try {
                System.out.println(prompt);
                double value = sc.nextDouble();
                sc.nextLine();
                return value;
            } catch (InputMismatchException e) {
                System.out.println("Solo se admiten números decimales");
                sc.nextLine();
            }
        }
    }

    public static String stringValidator(String prompt) {
        while (true) {
            System.out.println(prompt);
            String value = sc.nextLine().trim();
            if (!value.isEmpty()) {
                return value;
            }
            System.out.println("El valor no puede estar vacío");
        }
    }
}
