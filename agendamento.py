from flask import Blueprint, jsonify, request, render_template
from supabase import create_client
import os

# Configuração do Supabase
supabase_url = 'https://gccxbkoejigwkqwyvcav.supabase.co'
supabase_key = os.getenv(
    'SUPABASE_KEY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjY3hia29lamlnd2txd3l2Y2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2OTg5OTYsImV4cCI6MjA0OTI3NDk5Nn0.ADRY3SLagP-NjhAAvRRP8A4Ogvo7AbWvcW-J5gAbyr4'
)
supabase = create_client(supabase_url, supabase_key)

# Criação do Blueprint
agendamento_bp = Blueprint('agendamento_bp', __name__)

@agendamento_bp.route('/api/agendar-cliente', methods=['POST'])
def agendar_cliente():
    dados = request.get_json()

    # Validação simples: verifica se todos os campos obrigatórios estão presentes
    campos_obrigatorios = ["nome", "email", "usuario_id", "servico_id", "data", "horario"]
    for campo in campos_obrigatorios:
        if not dados.get(campo):
            return jsonify({"error": f"O campo '{campo}' é obrigatório"}), 400

    # Busca o id_empresa relacionado ao usuario_id
    usuario = supabase.table("usuarios").select("id_empresa").eq("id", dados["usuario_id"]).execute()
    if not usuario.data:
        return jsonify({"error": "Usuário não encontrado ou sem id_empresa"}), 404
    id_empresa = usuario.data[0]["id_empresa"]

    # Busca ou criação do cliente baseado no email
    cliente = supabase.table("clientes").select("id").eq("email", dados["email"]).execute()
    if cliente.data:
        cliente_id = cliente.data[0]["id"]  # Cliente já existe, usa o ID
    else:
        # Cria um novo cliente se não existir e inclui id_empresa
        cliente_response = supabase.table("clientes").insert({
            "nome_cliente": dados["nome"],
            "email": dados["email"],
            "telefone": dados.get("telefone"),
            "id_empresa": id_empresa  # Inclui o id_empresa automaticamente
        }).execute()
        if cliente_response.data:
            cliente_id = cliente_response.data[0]["id"]
        else:
            return jsonify({"error": "Erro ao registrar o cliente"}), 500

    # Inserção do agendamento na tabela "agenda" com todos os campos necessários
    response = supabase.table("agenda").insert({
        "cliente_id": cliente_id,
        "usuario_id": dados["usuario_id"],
        "servico_id": dados["servico_id"],
        "data": dados["data"],
        "horario": dados["horario"],
        "id_empresa": id_empresa,
        "descricao": dados.get("descricao"),
        "status": "ativo"
    }).execute()

    if response.data:
        return jsonify({"message": "Agendamento realizado com sucesso!"}), 201
    else:
        return jsonify({"error": "Erro ao criar agendamento"}), 500

@agendamento_bp.route('/api/empresas', methods=['GET'])
def listar_empresas():
    # Retorna a lista de empresas disponíveis, incluindo o campo "logo"
    response = supabase.table("empresa").select("id, nome_empresa, logo,descricao").execute()
    
    return jsonify(response.data), 200


@agendamento_bp.route('/api/usuarios/<int:empresa_id>', methods=['GET'])
def listar_usuarios(empresa_id):
    # Lista usuários vinculados a uma empresa específica
    response = supabase.table("usuarios").select("id, nome_usuario").eq("id_empresa", empresa_id).execute()
   
    return jsonify(response.data), 200

@agendamento_bp.route('/api/servicos/<int:empresa_id>', methods=['GET'])
def listar_servicos(empresa_id):
    # Lista serviços vinculados a uma empresa específica
    response = supabase.table("servicos").select("id, nome_servico").eq("id_empresa", empresa_id).execute()
    
    return jsonify(response.data), 200

@agendamento_bp.route('/api/checagem-horario/<int:usuario_id>/<string:data>/<string:horario>', methods=['GET'])
def checar_horario(usuario_id, data, horario):
    # Verifica se um horário específico já está agendado para um usuário
    response = supabase.table("agenda").select("*").eq("usuario_id", usuario_id).eq("data", data).eq("horario", horario).execute()
    
    if response.data:
        return jsonify({"exists": True}), 200
    else:
        return jsonify({"exists": False}), 200

@agendamento_bp.route('/agendamento', methods=['GET'])
def pagina_agendamento():
    # Renderiza a página HTML para o agendamento
    return render_template('agendamento_cli.html')
