from flask import Flask, render_template, request, send_file, jsonify
import os
from stegano_lsb import hide_message, discover_message
from PIL import Image
import io

app = Flask(__name__)

# Configuration pour Render
app.config['UPLOAD_FOLDER'] = '/tmp/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Créer le dossier uploads s'il n'existe pas
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Variable globale pour stocker les infos de debug
last_debug_info = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/encode', methods=['POST'])
def encode():
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'Aucune image sélectionnée'}), 400
        
        image_file = request.files['image']
        message = request.form.get('message', '')
        
        if image_file.filename == '':
            return jsonify({'success': False, 'error': 'Aucune image sélectionnée'}), 400
        
        if not message:
            return jsonify({'success': False, 'error': 'Aucun message fourni'}), 400
        
        # Sauvegarder l'image originale
        original_path = os.path.join(app.config['UPLOAD_FOLDER'], 'original.png')
        image_file.save(original_path)
        
        # Cacher le message et récupérer les infos de debug
        output_path = os.path.join(app.config['UPLOAD_FOLDER'], 'encoded.png')
        debug_info = hide_message(message, original_path, output_path)
        
        # Stocker les infos de debug globalement
        global last_debug_info
        last_debug_info = debug_info
        
        return jsonify({
            'success': True,
            'message': 'Message caché avec succès',
            'encoded_image': '/download/encoded',
            'debug_info': {
                'bits_utilises': debug_info['bits_utilises'],
                'pixels_modifies': debug_info['pixels_modifies']
            }
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/decode', methods=['POST'])
def decode():
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'Aucune image sélectionnée'}), 400
        
        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify({'success': False, 'error': 'Aucune image sélectionnée'}), 400
        
        # Sauvegarder l'image
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], 'to_decode.png')
        image_file.save(image_path)
        
        # Décoder le message
        message = discover_message(image_path)
        
        return jsonify({
            'success': True,
            'message': message
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/debug_info')
def debug_info():
    """Retourne les informations détaillées du dernier encodage"""
    try:
        global last_debug_info
        if last_debug_info:
            # S'assurer que les données sont sérialisables en JSON
            serializable_debug_info = {
                'message_binaire': str(last_debug_info.get('message_binaire', '')),
                'longueur_message_bits': int(last_debug_info.get('longueur_message_bits', 0)),
                'longueur_totale_bits': int(last_debug_info.get('longueur_totale_bits', 0)),
                'bits_utilises': int(last_debug_info.get('bits_utilises', 0)),
                'pixels_modifies': int(last_debug_info.get('pixels_modifies', 0)),
                'modifications_details': last_debug_info.get('modifications_details', [])
            }
            
            return jsonify({
                'success': True,
                'debug_info': serializable_debug_info
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Aucune information de debug disponible. Veuillez d\'abord encoder un message.'
            })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erreur lors de la récupération des informations: {str(e)}'
        }), 500

@app.route('/download/<type>')
def download(type):
    try:
        if type == 'encoded':
            filename = 'encoded.png'
        else:
            return jsonify({'success': False, 'error': 'Fichier non trouvé'}), 404
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        if not os.path.exists(file_path):
            return jsonify({'success': False, 'error': 'Fichier non trouvé'}), 404
        
        return send_file(file_path, as_attachment=True, download_name='image_secrete.png')
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Route de test pour vérifier que le JSON fonctionne
@app.route('/test_debug')
def test_debug():
    """Route de test pour vérifier que le JSON fonctionne"""
    test_data = {
        'success': True,
        'debug_info': {
            'message_binaire': '0101010101010101',
            'longueur_message_bits': 16,
            'longueur_totale_bits': 48,
            'bits_utilises': 48,
            'pixels_modifies': 16,
            'modifications_details': [
                {
                    'pixel': [0, 0],
                    'canal': 'R',
                    'bit_message': '0',
                    'valeur_originale': 255,
                    'valeur_modifiee': 254,
                    'binaire_original': '11111111',
                    'binaire_modifie': '11111110'
                }
            ]
        }
    }
    return jsonify(test_data)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)