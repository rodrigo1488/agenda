from flask import Blueprint, jsonify, request, render_template
from supabase import create_client, Client
import os

# Configuração do Supabase
supabase_url = 'https://gccxbkoejigwkqwyvcav.supabase.co'
supabase_key = os.getenv(
    'SUPABASE_KEY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjY3hia29lamlnd2txd3l2Y2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2OTg5OTYsImV4cCI6MjA0OTI3NDk5Nn0.ADRY3SLagP-NjhAAvRRP8A4Ogvo7AbWvcW-J5gAbyr4'
)
supabase: Client = create_client(supabase_url, supabase_key)

# Criação do Blueprint
agenda_cliente_bp = Blueprint('agenda_cliente_bp', __name__)

# Rota para renderizar a página agenda_cliente.html
@agenda_cliente_bp.route('/agenda_cliente')
def render_agendamentos_page():
    return render_template('agenda_cliente.html')

# Rota para buscar agendamentos por e-mail
@agenda_cliente_bp.route('/agendamentos/<email>', methods=['GET'])
def get_agendamentos_por_email(email):
    try:
        print(f"Buscando cliente com o email: {email}")
        cliente_result = supabase.table('clientes').select('id').eq('email', email).single().execute()
        
        if not cliente_result.data:
            print(f"Cliente não encontrado para o email: {email}")
            return jsonify({"erro": "Cliente não encontrado."}), 404
        
        cliente_id = cliente_result.data['id']
        print(f"Cliente encontrado com ID: {cliente_id}")

        agendamentos_result = supabase.table('agenda').select('*').eq('cliente_id', cliente_id).execute()
        
        if not agendamentos_result.data:
            print(f"Nenhum agendamento encontrado para o cliente ID: {cliente_id}")
            return jsonify({"mensagem": "Nenhum agendamento encontrado para este cliente."}), 404

        print(f"Agendamentos encontrados: {agendamentos_result.data}")
        return jsonify({"agendamentos": agendamentos_result.data}), 200

    except Exception as e:
        print(f"Erro ao buscar agendamentos: {str(e)}")
        return jsonify({"erro": str(e)}), 500
