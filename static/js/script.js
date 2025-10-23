class SteganoApp {
    constructor() {
        this.currentTab = 'encode';
        this.lastDebugInfo = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.showTab('encode');
    }

    bindEvents() {
        // Navigation tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.showTab(tab);
            });
        });

        // Encode form
        document.getElementById('encode-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.encodeMessage();
        });

        // Decode form
        document.getElementById('decode-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.decodeMessage();
        });

        // File uploads
        this.setupFileUpload('encode-image', 'encode-upload', 'encode-preview', 'encode-preview-img');
        this.setupFileUpload('decode-image', 'decode-upload', 'decode-preview', 'decode-preview-img');

        // Message character count
        document.getElementById('encode-message').addEventListener('input', (e) => {
            this.updateCharacterCount(e.target.value);
        });

        // Download button
        document.getElementById('download-btn').addEventListener('click', () => {
            this.downloadEncodedImage();
        });

        // New encode button
        document.getElementById('new-encode-btn').addEventListener('click', () => {
            this.resetEncodeForm();
        });

        // More info button
        document.getElementById('more-info-btn').addEventListener('click', () => {
            this.showMoreInfo();
        });
    }

    showTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Show active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
    }

    setupFileUpload(inputId, zoneId, previewId, previewImgId) {
        const fileInput = document.getElementById(inputId);
        const uploadZone = document.getElementById(zoneId);
        const preview = document.getElementById(previewId);
        const previewImg = document.getElementById(previewImgId);

        // Click on zone
        uploadZone.addEventListener('click', () => {
            fileInput.click();
        });

        // File selected
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.previewImage(e.target.files[0], preview, previewImg);
            }
        });

        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                this.previewImage(e.dataTransfer.files[0], preview, previewImg);
            }
        });
    }

    previewImage(file, previewElement, previewImgElement) {
        if (!file.type.match('image.*')) {
            this.showAlert('Veuillez sélectionner une image valide (PNG, JPG, BMP)', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImgElement.src = e.target.result;
            previewElement.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    updateCharacterCount(text) {
        const count = text.length;
        const countElement = document.getElementById('char-count');
        const capacityElement = document.getElementById('capacity-fill');
        
        countElement.textContent = `${count} caractères`;
        
        // Simple capacity indicator
        const percentage = Math.min((count / 1000) * 100, 100);
        capacityElement.style.width = `${percentage}%`;
        
        // Change color based on capacity
        if (percentage > 80) {
            capacityElement.style.background = '#f56565';
        } else if (percentage > 50) {
            capacityElement.style.background = '#ed8936';
        } else {
            capacityElement.style.background = '#48bb78';
        }
    }

    async encodeMessage() {
        const formData = new FormData(document.getElementById('encode-form'));
        const submitBtn = document.getElementById('encode-form').querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        try {
            // Show loading
            submitBtn.innerHTML = '<span class="loading"></span> Encodage en cours...';
            submitBtn.disabled = true;

            const response = await fetch('/encode', {
                method: 'POST',
                body: formData
            });

            // Vérifier si la réponse est du JSON valide
            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error('Réponse non-JSON:', text);
                throw new Error('Le serveur a retourné une réponse non-JSON. Vérifiez la console pour les détails.');
            }

            if (result.success) {
                this.lastDebugInfo = result.debug_info;
                this.showEncodeResults(result);
            } else {
                this.showAlert(result.error, 'error');
            }
        } catch (error) {
            console.error('Erreur encodage:', error);
            this.showAlert('Erreur lors de l\'encodage: ' + error.message, 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async decodeMessage() {
        const formData = new FormData(document.getElementById('decode-form'));
        const submitBtn = document.getElementById('decode-form').querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        try {
            // Show loading
            submitBtn.innerHTML = '<span class="loading"></span> Décodage en cours...';
            submitBtn.disabled = true;

            const response = await fetch('/decode', {
                method: 'POST',
                body: formData
            });

            // Vérifier si la réponse est du JSON valide
            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error('Réponse non-JSON:', text);
                throw new Error('Le serveur a retourné une réponse non-JSON. Vérifiez la console pour les détails.');
            }

            if (result.success) {
                this.showDecodeResults(result.message);
            } else {
                this.showAlert(result.error, 'error');
            }
        } catch (error) {
            console.error('Erreur décodage:', error);
            this.showAlert('Erreur lors du décodage: ' + error.message, 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    showEncodeResults(result) {
        document.getElementById('encode-results').style.display = 'block';
        document.getElementById('success-details').textContent = 
            `Votre message a été caché avec succès! ${result.debug_info.bits_utilises} bits utilisés sur ${result.debug_info.pixels_modifies} pixels modifiés.`;
        
        // Show the encoded image preview
        document.getElementById('encoded-preview').src = result.encoded_image + '?t=' + Date.now();
    }

    showDecodeResults(message) {
        document.getElementById('decode-results').style.display = 'block';
        document.getElementById('decoded-message').value = message;
    }

    async showMoreInfo() {
        if (!this.lastDebugInfo) {
            this.showAlert('Aucune information disponible. Veuillez d\'abord encoder un message.', 'error');
            return;
        }

        try {
            const response = await fetch('/debug_info');
            
            // Vérifier le statut HTTP
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
            }
            
            // Vérifier si la réponse est du JSON valide
            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error('Réponse non-JSON:', text);
                throw new Error('Le serveur a retourné une réponse non-JSON. Vérifiez la console pour les détails.');
            }

            if (result.success) {
                this.displayDebugInfo(result.debug_info);
            } else {
                this.showAlert(result.error, 'error');
            }
        } catch (error) {
            console.error('Erreur récupération infos:', error);
            this.showAlert('Erreur lors de la récupération des informations: ' + error.message, 'error');
        }
    }

    displayDebugInfo(debugInfo) {
        // Créer le contenu HTML pour les informations détaillées
        let html = `
            <div class="debug-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 1000;">
                <div style="background: white; padding: 30px; border-radius: 15px; max-width: 90%; max-height: 90%; overflow-y: auto; position: relative; width: 800px;">
                    <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">×</button>
                    
                    <h2 style="margin-bottom: 20px; color: #333; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 32px;">🔍</span>
                        Informations Détaillées d'Encodage
                    </h2>
                    
                    <div class="info-section" style="margin-bottom: 25px;">
                        <h3 style="color: #667eea; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                            <span>📊</span>
                            Statistiques de l'Encodage
                        </h3>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                            <div style="background: #f7fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
                                <div style="font-weight: 600; color: #667eea; margin-bottom: 5px;">Bits utilisés</div>
                                <div style="font-size: 24px; font-weight: 700;">${debugInfo.bits_utilises}</div>
                            </div>
                            <div style="background: #f7fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #48bb78;">
                                <div style="font-weight: 600; color: #667eea; margin-bottom: 5px;">Pixels modifiés</div>
                                <div style="font-size: 24px; font-weight: 700;">${debugInfo.pixels_modifies}</div>
                            </div>
                            <div style="background: #f7fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #ed8936;">
                                <div style="font-weight: 600; color: #667eea; margin-bottom: 5px;">Longueur message (bits)</div>
                                <div style="font-size: 24px; font-weight: 700;">${debugInfo.longueur_message_bits}</div>
                            </div>
                            <div style="background: #f7fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #9f7aea;">
                                <div style="font-weight: 600; color: #667eea; margin-bottom: 5px;">Longueur totale (bits)</div>
                                <div style="font-size: 24px; font-weight: 700;">${debugInfo.longueur_totale_bits}</div>
                            </div>
                        </div>
                    </div>

                    <div class="info-section" style="margin-bottom: 25px;">
                        <h3 style="color: #667eea; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                            <span>💬</span>
                            Message en Binaire Complet
                        </h3>
                        <div style="background: #1a202c; color: #a0aec0; padding: 20px; border-radius: 8px; font-family: 'Courier New', monospace; word-break: break-all; font-size: 14px; line-height: 1.4;">
                            ${debugInfo.message_binaire}
                        </div>
                        <div style="color: #718096; font-size: 12px; margin-top: 8px;">
                            Longueur: ${debugInfo.message_binaire.length} bits (32 bits pour la longueur + ${debugInfo.longueur_message_bits} bits du message)
                        </div>
                    </div>

                    <div class="info-section">
                        <h3 style="color: #667eea; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                            <span>🎨</span>
                            Détail des Pixels Modifiés (20 premiers)
                        </h3>
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse; background: #f7fafc; border-radius: 8px; font-size: 14px;">
                                <thead>
                                    <tr style="background: #667eea; color: white;">
                                        <th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Pixel (x,y)</th>
                                        <th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Canal</th>
                                        <th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Bit Message</th>
                                        <th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Valeur Originale</th>
                                        <th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Valeur Modifiée</th>
                                        <th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Binaire Original</th>
                                        <th style="padding: 12px; text-align: left; border: 1px solid #e2e8f0;">Binaire Modifié</th>
                                    </tr>
                                </thead>
                                <tbody>
        `;

        // Ajouter les lignes du tableau pour chaque modification
        debugInfo.modifications_details.forEach((mod, index) => {
            const rowColor = index % 2 === 0 ? '#ffffff' : '#f7fafc';
            html += `
                <tr style="background: ${rowColor};">
                    <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 600;">${mod.pixel[0]},${mod.pixel[1]}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0;">
                        <span style="display: inline-block; width: 20px; height: 20px; border-radius: 50%; background: ${
                            mod.canal === 'R' ? '#f56565' : mod.canal === 'G' ? '#48bb78' : '#4299e1'
                        }; color: white; text-align: center; line-height: 20px; font-size: 12px; font-weight: 600;">
                            ${mod.canal}
                        </span>
                    </td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #667eea; text-align: center;">${mod.bit_message}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${mod.valeur_originale}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; color: #48bb78; font-weight: bold; text-align: center;">${mod.valeur_modifiee}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; font-family: 'Courier New', monospace; font-size: 12px;">${mod.binaire_original}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; font-family: 'Courier New', monospace; font-size: 12px; color: #48bb78; font-weight: 600;">${mod.binaire_modifie}</td>
                </tr>
            `;
        });

        html += `
                                </tbody>
                            </table>
                        </div>
                        <div style="color: #718096; font-size: 12px; margin-top: 8px;">
                            Affichage des 20 premières modifications sur ${debugInfo.modifications_details.length} au total
                        </div>
                    </div>

                    <div style="text-align: center; margin-top: 25px;">
                        <button onclick="this.closest('.debug-modal').remove()" class="btn" style="background: #667eea; color: white; padding: 12px 24px;">
                            <span style="font-size: 16px;">✓</span>
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Ajouter le modal au body
        document.body.insertAdjacentHTML('beforeend', html);
    }

    downloadEncodedImage() {
        window.open('/download/encoded', '_blank');
    }

    resetEncodeForm() {
        document.getElementById('encode-form').reset();
        document.getElementById('encode-preview').style.display = 'none';
        document.getElementById('encode-results').style.display = 'none';
        this.updateCharacterCount('');
        this.lastDebugInfo = null;
    }

    showAlert(message, type = 'success') {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <div class="alert-icon">${type === 'success' ? '✅' : '❌'}</div>
            <div>${message}</div>
        `;

        // Insert alert at the top of the current tab content
        const currentTab = document.getElementById(`${this.currentTab}-tab`);
        currentTab.insertBefore(alert, currentTab.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 5000);
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SteganoApp();
});