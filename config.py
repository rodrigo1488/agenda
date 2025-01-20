from flask import Blueprint, render_template, request, redirect, url_for, flash
from supabase import create_client
import os

supabase_url = 'https://gccxbkoejigwkqwyvcav.supabase.co'
supabase_key = os.getenv('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjY3hia29lamlnd2txd3l2Y2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2OTg5OTYsImV4cCI6MjA0OTI3NDk5Nn0.ADRY3SLagP-NjhAAvRRP8A4Ogvo7AbWvcW-J5gAbyr4')
supabase = create_client(supabase_url, supabase_key)

config_bp = Blueprint('config', __name__)

def verificar_login():
    if 'user_id' not in request.cookies or 'empresa_id' not in request.cookies:
        flash('Você precisa estar logado para acessar essa página.', 'danger')
        return redirect(url_for('login.login'))  # Redireciona para a página de login
    return None

# Rota para exibir o formulário de atualização
@config_bp.route('/configuracao', methods=['GET'])
def configuracao_empresa():
    login_redirect = verificar_login()
    if login_redirect:
        return login_redirect

    empresa_id = request.cookies.get('empresa_id')

    # Busca os dados da empresa no banco de dados
    response = supabase.table("empresa").select("*").eq("id", empresa_id).execute()
    if not response.data:
        flash('Empresa não encontrada.', 'danger')
        return redirect(url_for('login.login'))  # Redireciona para a página de login

    empresa = response.data[0]
    return render_template('configuracao.html', empresa=empresa)

# Rota para atualizar os dados da empresa
@config_bp.route('/configuracao/atualizar', methods=['POST'])
def atualizar_configuracao():
    login_redirect = verificar_login()
    if login_redirect:
        return login_redirect

    empresa_id = request.cookies.get('empresa_id')

    # Dados enviados pelo formulário
    dados_atualizados = {
        "kids": request.form.get("kids") == 'on',
        "estacionamento": request.form.get("estacionamento") == 'on',
        "wifi": request.form.get("wifi") == 'on',
        "acessibilidade": request.form.get("acessibilidade") == 'on',
        "horario": request.form.get("horario"),
        "tel_empresa": request.form.get("tel_empresa"),
        "status": request.form.get("status"),
        "descricao": request.form.get("descricao"),
    }

    try:
        # Atualiza os dados no banco de dados
        response = supabase.table("empresa").update(dados_atualizados).eq("id", empresa_id).execute()
        if response.status_code == 204:
            flash('Configurações atualizadas com sucesso!', 'success')
        else:
            flash('Erro ao atualizar configurações.', 'danger')
    except Exception as e:
        print(f"Erro ao atualizar configurações: {e}")
        flash('Erro ao atualizar configurações.', 'danger')

    return redirect(url_for('config.configuracao_empresa')) 
