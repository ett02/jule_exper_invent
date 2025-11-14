package com.example.demo.service;

import com.example.demo.dto.AppointmentRequest;
import com.example.demo.dto.WaitingListRequest;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class WaitingListService {

    @Autowired
    private WaitingListRepository waitingListRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private BarbersRepository barbersRepository;

    @Autowired
    private ServicesRepository servicesRepository;

    @Autowired
    private AppointmentsService appointmentsService;

    @Transactional
    public WaitingList addToWaitingList(WaitingListRequest request) {
        Users customer = usersRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Cliente non trovato"));
        Barbers barber = barbersRepository.findById(request.getBarberId())
                .orElseThrow(() -> new RuntimeException("Barbiere non trovato"));
        Services service = servicesRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Servizio non trovato"));

        WaitingList waitingList = new WaitingList();
        waitingList.setCustomer(customer);
        waitingList.setBarber(barber);
        waitingList.setService(service);
        waitingList.setDataRichiesta(request.getDataRichiesta());
        waitingList.setDataIscrizione(LocalDateTime.now());
        waitingList.setStato(WaitingList.StatoListaAttesa.IN_ATTESA);

        return waitingListRepository.save(waitingList);
    }

    public List<WaitingList> getWaitingListByCustomer(Long customerId) {
        return waitingListRepository.findByCustomerId(customerId);
    }

    public List<WaitingList> getActiveWaitingListByBarberAndDate(Long barberId, java.time.LocalDate data) {
        return waitingListRepository.findByBarberIdAndDataRichiestaAndStatoOrderByDataIscrizioneAsc(
                barberId, data, WaitingList.StatoListaAttesa.IN_ATTESA);
    }

    @Transactional
    public void processWaitingListForCancelledAppointment(Appointments cancelledAppointment) {
        // Trova il primo in lista d'attesa per quel barbiere, servizio e data
        Optional<WaitingList> firstInQueue = waitingListRepository
                .findFirstByBarberIdAndServiceIdAndDataRichiestaAndStatoOrderByDataIscrizioneAsc(
                        cancelledAppointment.getBarber().getId(),
                        cancelledAppointment.getService().getId(),
                        cancelledAppointment.getData(),
                        WaitingList.StatoListaAttesa.IN_ATTESA
                );

        if (firstInQueue.isPresent()) {
            WaitingList waitingEntry = firstInQueue.get();

            // Crea automaticamente l'appuntamento per il primo in coda
            AppointmentRequest appointmentRequest = new AppointmentRequest();
            appointmentRequest.setCustomerId(waitingEntry.getCustomer().getId());
            appointmentRequest.setBarberId(waitingEntry.getBarber().getId());
            appointmentRequest.setServiceId(waitingEntry.getService().getId());
            appointmentRequest.setData(cancelledAppointment.getData());
            appointmentRequest.setOrarioInizio(cancelledAppointment.getOrarioInizio());

            try {
                appointmentsService.createAppointment(appointmentRequest);

                // Aggiorna lo stato nella lista d'attesa
                waitingEntry.setStato(WaitingList.StatoListaAttesa.CONFERMATO);
                waitingListRepository.save(waitingEntry);

                // TODO: Invia notifica al cliente (implementata in STEP 4)
                System.out.println("Slot assegnato a: " + waitingEntry.getCustomer().getEmail());

            } catch (Exception e) {
                System.err.println("Errore nell'assegnazione automatica dello slot: " + e.getMessage());
            }
        }
    }

    @Transactional
    public void cancelWaitingListEntry(Long id) {
        WaitingList entry = waitingListRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voce lista d'attesa non trovata"));
        entry.setStato(WaitingList.StatoListaAttesa.ANNULLATO);
        waitingListRepository.save(entry);
    }

    public Integer getPositionInQueue(Long waitingListId) {
        WaitingList entry = waitingListRepository.findById(waitingListId)
                .orElseThrow(() -> new RuntimeException("Voce lista d'attesa non trovata"));

        List<WaitingList> queue = waitingListRepository
                .findByBarberIdAndDataRichiestaAndStatoOrderByDataIscrizioneAsc(
                        entry.getBarber().getId(),
                        entry.getDataRichiesta(),
                        WaitingList.StatoListaAttesa.IN_ATTESA
                );

        for (int i = 0; i < queue.size(); i++) {
            if (queue.get(i).getId().equals(waitingListId)) {
                return i + 1; // Posizione 1-based
            }
        }

        return null;
    }
}
