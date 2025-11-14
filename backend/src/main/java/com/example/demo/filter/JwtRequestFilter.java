package com.example.demo.filter;

import com.example.demo.service.UserDetailsServiceImpl;
import com.example.demo.util.JwtUtil;
// Rimuovi l'import di 'Claims' e altri non necessari
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// Rimuovi 'SimpleGrantedAuthority', 'Arrays', 'List', 'Collectors'
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                System.out.println("Errore estrazione username: " + e.getMessage());
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // --- MODIFICA CHIAVE ---
            // 1. Carichiamo l'utente FRESCO dal DB.
            // Questo 'userDetails' contiene le autorità corrette (es. "ADMIN")
            // grazie al fix che hai già fatto in UserDetailsServiceImpl.
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // 2. Validiamo il token
            if (jwtUtil.validateToken(jwt, userDetails)) {
                
                // 3. Creiamo l'autenticazione USANDO LE AUTORITÀ FRESCHE DAL DB
                // Non leggiamo più dal token, usiamo userDetails.getAuthorities()
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()); // <-- LA SOLUZIONE
                
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}