package org.manhdev.testcrudspringboot.configuration;

import java.text.ParseException;
import java.util.Objects;
import javax.crypto.spec.SecretKeySpec;

import org.manhdev.testcrudspringboot.dto.request.IntrospectRequest;
import org.manhdev.testcrudspringboot.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import com.nimbusds.jose.JOSEException;

@Component
// lớp này dùng để giải mã token và kiểm tra tính hợp lệ của token
public class CustomJwtDecoder implements JwtDecoder {
    @Value("${jwt.signerKey}")
    private String signerKey;

    @Autowired
    private AuthenticationService authenticationService;

    //    dùng để giải mã (decode) và xác thực (validate) token JWT dựa trên khóa bí mật và
    //    thuật toán mã hóa HMAC-SHA512 (HS512).
    private NimbusJwtDecoder nimbusJwtDecoder = null;

    @Override
    //    ghi đè method decode để giải mã và xác thực token
    public Jwt decode(String token) throws JwtException {
        try {
            //            lấy introspect kiểm tra token hợp lệ từ class authenticationService
            var response = authenticationService.introspect(
                    IntrospectRequest.builder().token(token).build());

            //            kiểm tra xem token có hợp lệ không, nếu k hợp lệ thì trả ra ngoại lệ JwtException với
            //            nội dung là Token invalid
            if (!response.isValid()) throw new JwtException("Token invalid");
        } catch (JOSEException | ParseException e) {
            throw new JwtException(e.getMessage());
        }

        if (Objects.isNull(nimbusJwtDecoder)) {
            SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
            nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                    .macAlgorithm(MacAlgorithm.HS512)
                    .build();
        }

        return nimbusJwtDecoder.decode(token);
    }
}
