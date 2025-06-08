document.addEventListener('DOMContentLoaded', () => {
    // Globální proměnné
    let currentSubjectId = null;
    let selectedPlaceId = null;
    let selectedPlaceName = '';
    
    // DOM prvky
    const subjectsTable = document.getElementById('subjects-table').querySelector('tbody');
    const subjectSelect = document.getElementById('subject-select');
    const classroomContainer = document.getElementById('classroom-container');
    const classroomGrid = document.getElementById('classroom-grid');
    const studentsTable = document.getElementById('students-table').querySelector('tbody');
    
    // Zobrazí chybu
    function showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        setTimeout(() => errorElement.textContent = '', 5000);
    }

    // Načtení předmětů
    async function loadSubjects() {
        try {
            const response = await fetch('/api/subjects');
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Nepodařilo se načíst předměty');
            }
            
            const subjects = await response.json();
            
            // Bezpečná kontrola
            if (!Array.isArray(subjects)) {
                throw new Error('Neplatný formát dat');
            }
            
            // Naplnění tabulky
            subjectsTable.innerHTML = '';
            subjects.forEach(subject => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${escapeHtml(subject.name)}</td>
                    <td>${escapeHtml(subject.code)}</td>
                    <td>
                        <button onclick="editSubject(${subject.id}, '${escapeHtml(subject.name)}', '${escapeHtml(subject.code)}')">Upravit</button>
                        <button class="delete" onclick="deleteSubject(${subject.id})">Smazat</button>
                    </td>
                `;
                subjectsTable.appendChild(row);
            });
            
            // Naplnění selectu
            subjectSelect.innerHTML = '<option value="">Vyberte předmět</option>';
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = `${escapeHtml(subject.code)} - ${escapeHtml(subject.name)}`;
                subjectSelect.appendChild(option);
            });
            
        } catch (error) {
            console.error('Chyba při načítání předmětů:', error);
            showError('Chyba při načítání předmětů: ' + error.message);
        }
    }
    
    // Přidání předmětu
    document.getElementById('add-subject').addEventListener('click', async () => {
        const name = document.getElementById('subject-name').value.trim();
        const code = document.getElementById('subject-code').value.trim();
        
        if (!name || !code) {
            showError('Vyplňte název i zkratku předmětu');
            return;
        }
        
        try {
            const response = await fetch('/api/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, code })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Chyba při přidávání předmětu');
            }
            
            document.getElementById('subject-name').value = '';
            document.getElementById('subject-code').value = '';
            await loadSubjects();
            
        } catch (error) {
            console.error('Chyba:', error);
            showError(error.message);
        }
    });
    
    // Editace předmětu
    window.editSubject = (id, currentName, currentCode) => {
        document.getElementById('edit-subject-id').value = id;
        document.getElementById('edit-subject-name').value = currentName;
        document.getElementById('edit-subject-code').value = currentCode;
        document.getElementById('edit-subject-form').style.display = 'block';
    };
    
    document.getElementById('save-edit-subject').addEventListener('click', async () => {
        const id = document.getElementById('edit-subject-id').value;
        const name = document.getElementById('edit-subject-name').value.trim();
        const code = document.getElementById('edit-subject-code').value.trim();
        
        try {
            const response = await fetch(`/api/subjects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, code })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Chyba při úpravě předmětu');
            }
            
            document.getElementById('edit-subject-form').style.display = 'none';
            await loadSubjects();
            
            // Aktualizace selectu pokud editujeme aktuální předmět
            if (currentSubjectId == id) {
                const option = subjectSelect.querySelector(`option[value="${id}"]`);
                if (option) option.textContent = `${code} - ${name}`;
            }
            
        } catch (error) {
            console.error('Chyba:', error);
            showError(error.message);
        }
    });
    
    document.getElementById('cancel-edit-subject').addEventListener('click', () => {
        document.getElementById('edit-subject-form').style.display = 'none';
    });
    
    // Smazání předmětu
    window.deleteSubject = async (id) => {
        if (!confirm('Opravdu chcete smazat tento předmět? Vymažou se i všechny související záznamy o zasedacím pořádku.')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Chyba při mazání předmětu');
            }
            
            await loadSubjects();
            if (currentSubjectId === id) {
                currentSubjectId = null;
                classroomContainer.style.display = 'none';
            }
            
        } catch (error) {
            console.error('Chyba:', error);
            showError(error.message);
        }
    };
    
    // Výběr předmětu
    subjectSelect.addEventListener('change', (e) => {
        currentSubjectId = e.target.value;
        if (currentSubjectId) {
            classroomContainer.style.display = 'block';
            loadClassroom();
            loadStudents();
            resetSeatSelection();
        } else {
            classroomContainer.style.display = 'none';
        }
    });
    
    // Načtení třídy
    async function loadClassroom() {
        try {
            // Načíst obsazená místa a volná místa paralelně
            const [seatsResponse, placesResponse] = await Promise.all([
                fetch(`/api/seating?subject_id=${currentSubjectId}`),
                fetch(`/api/places/available?subject_id=${currentSubjectId}`)
            ]);
            
            if (!seatsResponse.ok || !placesResponse.ok) {
                throw new Error('Nepodařilo se načíst data třídy');
            }
            
            const seats = await seatsResponse.json();
            const availablePlaces = await placesResponse.json();
            
            // Vytvořit mapy pro rychlé vyhledávání
            const occupiedMap = {};
            seats.forEach(seat => {
                occupiedMap[`${seat.row}-${seat.column}`] = seat;
            });
            
            const availableMap = {};
            availablePlaces.forEach(place => {
                availableMap[`${place.row}-${place.column}`] = place;
            });
            
            // Vytvořit grid třídy
            classroomGrid.innerHTML = '';
            for (let row = 1; row <= 5; row++) {
                for (let col = 1; col <= 6; col++) {
                    const placeName = `${String.fromCharCode(64 + row)}${col}`;
                    const seat = document.createElement('div');
                    seat.className = 'seat';
                    seat.innerHTML = `<span class="seat-label">${placeName}</span>`;
                    
                    // Zkontrolovat stav místa
                    if (occupiedMap[`${row}-${col}`]) {
                        const student = occupiedMap[`${row}-${col}`];
                        seat.classList.add('occupied');
                        seat.innerHTML += `
                            <div class="student-name">
                                ${escapeHtml(student.firstname.charAt(0))}. ${escapeHtml(student.lastname)}
                            </div>
                        `;
                    } else if (availableMap[`${row}-${col}`]) {
                        const place = availableMap[`${row}-${col}`];
                        seat.classList.add('available');
                        seat.addEventListener('click', () => {
                            selectSeat(seat, place.id, placeName);
                        });
                    }
                    
                    classroomGrid.appendChild(seat);
                }
            }
        } catch (error) {
            console.error('Chyba při načítání třídy:', error);
            showError('Chyba při načítání třídy: ' + error.message);
        }
    }
    
    // Výběr místa
    function selectSeat(seatElement, placeId, placeName) {
        // Odznačit předchozí výběr
        document.querySelectorAll('.seat').forEach(s => {
            s.classList.remove('selected');
        });
        
        // Označit nové místo
        seatElement.classList.add('selected');
        
        // Uložit výběr
        selectedPlaceId = placeId;
        selectedPlaceName = placeName;
        document.getElementById('selected-place-name').textContent = placeName;
        document.getElementById('selected-place-id').value = placeId;
    }
    
    // Reset výběru místa
    function resetSeatSelection() {
        selectedPlaceId = null;
        selectedPlaceName = '';
        document.getElementById('selected-place-name').textContent = 'Žádné';
        document.getElementById('selected-place-id').value = '';
        document.querySelectorAll('.seat').forEach(s => s.classList.remove('selected'));
    }
    
    // Načtení žáků
    async function loadStudents() {
        try {
            const response = await fetch(`/api/seating?subject_id=${currentSubjectId}`);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Nepodařilo se načíst žáky');
            }
            
            const students = await response.json();
            studentsTable.innerHTML = '';
            
            students.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${escapeHtml(student.firstname)}</td>
                    <td>${escapeHtml(student.lastname)}</td>
                    <td>${String.fromCharCode(64 + student.row)}${student.column}</td>
                    <td>
                        <button class="delete" onclick="deleteStudent(${student.id})">Odebrat</button>
                    </td>
                `;
                studentsTable.appendChild(row);
            });
        } catch (error) {
            console.error('Chyba při načítání žáků:', error);
            showError('Chyba při načítání žáků: ' + error.message);
        }
    }
    
    // Přidání žáka
    document.getElementById('add-student').addEventListener('click', async () => {
        const firstname = document.getElementById('student-firstname').value.trim();
        const lastname = document.getElementById('student-lastname').value.trim();
        
        if (!firstname || !lastname) {
            showError('Vyplňte jméno a příjmení žáka');
            return;
        }
        
        if (!selectedPlaceId) {
            showError('Vyberte místo kliknutím na třídu');
            return;
        }
        
        try {
            const response = await fetch('/api/seating', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject_id: currentSubjectId,
                    place_id: selectedPlaceId,
                    firstname,
                    lastname
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Chyba při přidávání žáka');
            }
            
            // Reset formuláře
            document.getElementById('student-firstname').value = '';
            document.getElementById('student-lastname').value = '';
            resetSeatSelection();
            
            // Aktualizace dat
            await loadClassroom();
            await loadStudents();
            
        } catch (error) {
            console.error('Chyba:', error);
            showError(error.message);
        }
    });
    
    // Smazání žáka
    window.deleteStudent = async (id) => {
        if (!confirm('Opravdu chcete odebrat tohoto žáka?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/seating/${id}`, { method: 'DELETE' });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Chyba při odebírání žáka');
            }
            
            await loadClassroom();
            await loadStudents();
            resetSeatSelection();
            
        } catch (error) {
            console.error('Chyba:', error);
            showError(error.message);
        }
    };
    
    // Pomocná funkce pro escapování HTML
    function escapeHtml(str) {
        if (!str) return '';
        return str.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Inicializace
    loadSubjects();
});