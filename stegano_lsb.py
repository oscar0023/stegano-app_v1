from numpy import asarray
from PIL import Image

def hide_message(message, input_path, output_path):
    """Cache un message dans une image en utilisant LSB - Version avec debug"""
    image = Image.open(input_path)
    data = asarray(image).copy()
    original_data = asarray(image).copy()  # Garder une copie des données originales
    
    # Convertir le message en binaire
    binary_message = ""
    for char in message:
        ascii_value = ord(char)
        binary_char = bin(ascii_value)[2:].zfill(8)
        binary_message += binary_char
    
    # Ajouter la longueur du message (32 bits)
    message_length = len(binary_message)
    length_binary = bin(message_length)[2:].zfill(32)
    final_message = length_binary + binary_message
    
    print(f"Message à encoder ({message_length} bits): {final_message}")
    
    # Structures pour stocker les informations de debug
    modifications = []
    bit_index = 0
    total_bits = len(final_message)
    
    # Cacher le message dans l'image
    for y in range(data.shape[0]):
        for x in range(data.shape[1]):
            for rgb in range(3):  # R, G, B
                if bit_index < total_bits:
                    # Récupérer la valeur actuelle
                    current_value = data[y][x][rgb]
                    original_value = original_data[y][x][rgb]
                    
                    # Convertir en binaire
                    binary_value = bin(current_value)[2:].zfill(8)
                    
                    # Remplacer le LSB
                    new_binary = binary_value[:-1] + final_message[bit_index]
                    
                    # Convertir en décimal
                    new_value = int(new_binary, 2)
                    
                    # Mettre à jour
                    data[y][x][rgb] = new_value
                    
                    # Stocker les modifications pour le debug (limité aux 20 premières)
                    if len(modifications) < 20:
                        modifications.append({
                            'pixel': [int(x), int(y)],  # S'assurer que ce sont des int
                            'canal': ['R', 'G', 'B'][rgb],
                            'bit_message': str(final_message[bit_index]),  # S'assurer que c'est une string
                            'valeur_originale': int(original_value),  # S'assurer que c'est un int
                            'valeur_modifiee': int(new_value),  # S'assurer que c'est un int
                            'binaire_original': str(binary_value),  # S'assurer que c'est une string
                            'binaire_modifie': str(new_binary)  # S'assurer que c'est une string
                        })
                    
                    bit_index += 1
                else:
                    break
            if bit_index >= total_bits:
                break
        if bit_index >= total_bits:
            break
    
    # Sauvegarder l'image
    result_image = Image.fromarray(data)
    result_image.save(output_path)
    
    # Retourner les informations de debug (sérialisables en JSON)
    debug_info = {
        'message_binaire': str(final_message),  # S'assurer que c'est une string
        'longueur_message_bits': int(message_length),  # S'assurer que c'est un int
        'longueur_totale_bits': int(len(final_message)),  # S'assurer que c'est un int
        'bits_utilises': int(bit_index),  # S'assurer que c'est un int
        'pixels_modifies': int((bit_index + 2) // 3),  # S'assurer que c'est un int
        'modifications_details': modifications
    }
    
    return debug_info

def discover_message(input_path):
    """Récupère un message caché dans une image"""
    image = Image.open(input_path)
    data = asarray(image).copy()
    
    # Lire les 32 premiers bits pour la longueur
    length_binary = ""
    bit_count = 0
    
    # Extraire la longueur du message
    for y in range(data.shape[0]):
        for x in range(data.shape[1]):
            for rgb in range(3):
                if bit_count < 32:
                    current_value = data[y][x][rgb]
                    binary_value = bin(current_value)[2:].zfill(8)
                    length_binary += binary_value[-1]
                    bit_count += 1
                else:
                    break
            if bit_count >= 32:
                break
        if bit_count >= 32:
            break
    
    # Convertir la longueur
    if not length_binary:
        return "Aucun message détecté dans l'image"
    
    message_length = int(length_binary, 2)
    print(f"Longueur du message détectée: {message_length} bits")
    
    # Extraire le message
    message_binary = ""
    bit_count = 0
    start_y = 0
    start_x = 0
    start_rgb = 0
    
    # Trouver où nous nous sommes arrêtés
    for y in range(data.shape[0]):
        for x in range(data.shape[1]):
            for rgb in range(3):
                if bit_count < 32:
                    bit_count += 1
                    if bit_count == 32:
                        start_y = y
                        start_x = x
                        start_rgb = rgb + 1
                        if start_rgb >= 3:
                            start_rgb = 0
                            start_x += 1
                            if start_x >= data.shape[1]:
                                start_x = 0
                                start_y += 1
                        break
            if bit_count >= 32:
                break
        if bit_count >= 32:
            break
    
    # Extraire le message
    bit_count = 0
    for y in range(start_y, data.shape[0]):
        for x in range(start_x if y == start_y else 0, data.shape[1]):
            for rgb in range(start_rgb if y == start_y and x == start_x else 0, 3):
                if bit_count < message_length:
                    current_value = data[y][x][rgb]
                    binary_value = bin(current_value)[2:].zfill(8)
                    message_binary += binary_value[-1]
                    bit_count += 1
                else:
                    break
            if bit_count >= message_length:
                break
        if bit_count >= message_length:
            break
    
    # Convertir le binaire en texte
    message = ""
    for i in range(0, len(message_binary), 8):
        byte = message_binary[i:i+8]
        if len(byte) == 8:
            char_code = int(byte, 2)
            # Vérifier que c'est un caractère valide
            if 0 <= char_code <= 1114111:  # Plage Unicode valide
                message += chr(char_code)
            else:
                message += f"[{char_code}]"
    
    return message if message else "Aucun message valide détecté"