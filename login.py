from datetime import timedelta
from flask import Blueprint, render_template, request, redirect, url_for, flash, make_response, jsonify
from supabase import create_client
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os

# Configuração do Supabase
supabase_url = 'https://gccxbkoejigwkqwyvcav.supabase.co'
supabase_key = os.getenv(
    'SUPABASE_KEY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjY3hia29lamlnd2txd3l2Y2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2OTg5OTYsImV4cCI6MjA0OTI3NDk5Nn0.ADRY3SLagP-NjhAAvRRP8A4Ogvo7AbWvcW-J5gAbyr4'
)
supabase = create_client(supabase_url, supabase_key)

login_bp = Blueprint('login', __name__)

@login_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        empresa = request.form.get('empresa').strip().upper()
        usuario = request.form.get('usuario').strip().upper()
        senha = request.form.get('senha').strip()

        try:
            # Verifica se a empresa existe
            empresa_data = supabase.table('empresa').select('id').eq('nome_empresa', empresa).single().execute()
            if not empresa_data.data:
                flash('Empresa não encontrada.', 'danger')
                return redirect(url_for('login.login'))

            id_empresa = empresa_data.data['id']

            # Verifica se o usuário e a senha são válidos
            usuario_data = supabase.table('usuarios').select('id, nome_usuario').eq('nome_usuario', usuario).eq(
                'senha', senha).eq('id_empresa', id_empresa).single().execute()
            if not usuario_data.data:
                flash('Usuário ou senha inválidos.', 'danger')
                return redirect(url_for('login.login'))

            # Armazena os dados no cookie, validando para expirar em um certo tempo (ex: 30 dias)
            resp = make_response(redirect(url_for('agenda_bp.renderizar_agenda')))
            resp.set_cookie('user_id', str(usuario_data.data['id']), max_age=timedelta(days=30))
            resp.set_cookie('user_name', usuario_data.data['nome_usuario'], max_age=timedelta(days=30))
            resp.set_cookie('empresa_id', str(id_empresa), max_age=timedelta(days=30))

            # Login bem-sucedido
            return resp

        except Exception as e:
            flash(f'Usuário ou senha incorretos.', 'danger')
            return redirect(url_for('login.login'))

    return render_template('login.html')

@login_bp.route('/logout')
def logout():
    resp = make_response(redirect(url_for('login.login')))
    resp.delete_cookie('user_id')  # Remove o cookie user_id
    resp.delete_cookie('user_name')  # Remove o cookie user_name
    resp.delete_cookie('empresa_id')  # Remove o cookie empresa_id
    flash('Você foi desconectado com sucesso!', 'success')
    return resp


@login_bp.route('/verificar-cookies')
def verificar_cookies():
    # Verifica se os cookies estão sendo enviados corretamente
    user_id = request.cookies.get('user_id')
    user_name = request.cookies.get('user_name')
    empresa_id = request.cookies.get('empresa_id')

    # Retorna uma mensagem com os valores dos cookies
    if user_id and user_name and empresa_id:
        return f'Cookies armazenados com sucesso: user_id={user_id}, user_name={user_name}, empresa_id={empresa_id}'
    else:
        return 'Cookies não encontrados.'


# Configurações de e-mail
EMAIL_REMETENTE = 'sgrdital01@gmail.com'
SENHA_APP = 'dsbufjiwxttereis'

def enviar_email(destinatario):
    try:
        # Configura a mensagem de e-mail
        mensagem = MIMEMultipart()
        mensagem['From'] = EMAIL_REMETENTE
        mensagem['To'] = destinatario
        mensagem['Subject'] = 'Hello World'

        corpo = 'Hello World'
        mensagem.attach(MIMEText(corpo, 'plain'))

        # Conecta ao servidor SMTP do Gmail
        servidor = smtplib.SMTP('smtp.gmail.com', 587)
        servidor.starttls()
        servidor.login(EMAIL_REMETENTE, SENHA_APP)

        # Envia o e-mail
        servidor.sendmail(EMAIL_REMETENTE, destinatario, mensagem.as_string())
        servidor.quit()

        return True
    except Exception as e:
        print(f"Erro ao enviar e-mail: {e}")
        return False
    

@login_bp.route('/enviar-email', methods=['POST'])
def enviar_email_formulario():
    dados = request.json
    email_destinatario = dados.get('email')
    if not email_destinatario:
        return jsonify({"erro": "Email não fornecido"}), 400

    sucesso = enviar_email(email_destinatario)
    if sucesso:
        return jsonify({"mensagem": "Email enviado com sucesso!"}), 200
    else:
        return jsonify({"erro": "Falha ao enviar email"}), 500