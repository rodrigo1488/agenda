from flask import Blueprint
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import time
from supabase import create_client
import os
import threading


supabase_url = 'https://gccxbkoejigwkqwyvcav.supabase.co'
supabase_key = os.getenv(
    'SUPABASE_KEY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjY3hia29lamlnd2txd3l2Y2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2OTg5OTYsImV4cCI6MjA0OTI3NDk5Nn0.ADRY3SLagP-NjhAAvRRP8A4Ogvo7AbWvcW-J5gAbyr4'
)
supabase = create_client(supabase_url, supabase_key)



# Criação do Blueprint
lembrete_email_bp = Blueprint('lembrete_email_bp', __name__)

# Função para enviar e-mail
def enviar_email(destinatario, assunto, mensagem, email_remetente, senha_remetente):
    try:
        servidor_smtp = 'smtp.gmail.com'
        porta_smtp = 587
        msg = MIMEMultipart()
        msg['From'] = email_remetente
        msg['To'] = destinatario
        msg['Subject'] = assunto
        msg.attach(MIMEText(mensagem, 'plain'))

        with smtplib.SMTP(servidor_smtp, porta_smtp) as servidor:
            servidor.starttls()
            servidor.login(email_remetente, senha_remetente)
            servidor.send_message(msg)
            print("E-mail enviado com sucesso!")
    except smtplib.SMTPException as e:
        print(f"Erro ao enviar e-mail: {e}")

# Função para verificar agendamentos
lock = threading.Lock()

def verificar_agendamentos():
    if lock.locked():
        print("A tarefa já está sendo executada. Esperando...")
        return
    with lock:
        # O código da verificação de agendamentos vai aqui
        print("Verificando agendamentos...")
    while True:
        agora = datetime.now()
        tempo_limite = agora + timedelta(minutes=30)

        try:
            agendamentos = supabase.table('agenda').select('*').eq('status', 'ativo').execute()
            if agendamentos.data:
                for agendamento in agendamentos.data:
                    data_horario = datetime.strptime(f"{agendamento['data']} {agendamento['horario']}", "%Y-%m-%d %H:%M:%S")
                    if agora <= data_horario <= tempo_limite and not agendamento.get('notificado'):
                        cliente = supabase.table('clientes').select('nome_cliente, email').eq('id', agendamento['cliente_id']).execute().data[0]
                        usuario = supabase.table('usuarios').select('nome_usuario, email').eq('id', agendamento['usuario_id']).execute().data[0]
                        empresa = supabase.table('empresa').select('email, senha_app').eq('id', agendamento['id_empresa']).execute().data[0]

                        data_formatada = datetime.strptime(agendamento['data'], "%Y-%m-%d").strftime("%d/%m/%Y")
                        hora_formatada = datetime.strptime(agendamento['horario'], "%H:%M:%S").strftime("%H:%M")

                        assunto_cliente = "Lembrete de Agendamento"
                        mensagem_cliente = (
                            f"Prezado(a) {cliente['nome_cliente']},\n\n"
                            f"Este é um lembrete para o seu agendamento no dia {data_formatada} às {hora_formatada}.\n\n"
                            f"Por favor, esteja presente no horário agendado. Caso precise reagendar, entre em contato conosco com antecedência.\n\n"
                            f"Atenciosamente,\nEquipe {empresa['email']}"
                        )
                        

                        assunto_usuario = "Lembrete de Agendamento para Cliente"
                        mensagem_usuario = (
                            f"Prezado(a) {usuario['nome_usuario']},\n\n"
                            f"Gostaríamos de lembrá-lo(a) do agendamento do cliente {cliente['nome_cliente']} para o dia {data_formatada} às {hora_formatada}.\n\n"
                            f"Certifique-se de que tudo esteja preparado para atendê-lo(a).\n\n"
                            f"Atenciosamente,\nEquipe {empresa['email']}"
                        )

                        enviar_email(cliente['email'], assunto_cliente, mensagem_cliente, empresa['email'], empresa['senha_app'])
                        enviar_email(usuario['email'], assunto_usuario, mensagem_usuario, empresa['email'], empresa['senha_app'])
                        supabase.table('agenda').update({'notificado': True}).eq('id', agendamento['id']).execute()
        except Exception as e:
            print(f"Erro ao verificar agendamentos: {e}")

# Função para iniciar o scheduler