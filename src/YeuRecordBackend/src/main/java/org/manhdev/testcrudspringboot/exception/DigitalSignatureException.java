package org.manhdev.testcrudspringboot.exception;

public class DigitalSignatureException extends RuntimeException {
    public DigitalSignatureException(String message, Throwable cause) {
        super(message, cause);
    }
}