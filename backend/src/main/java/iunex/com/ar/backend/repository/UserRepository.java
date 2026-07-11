package iunex.com.ar.backend.repository;

import iunex.com.ar.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring entiende el nombre del método y genera el SQL:
    // SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByUsernameIgnoreCase(String username);

    // Método rápido para saber si ya existe un correo (devuelve true o false)
    boolean existsByEmail(String email);

    boolean existsByUsernameIgnoreCase(String username);
}
