from flask import Blueprint, render_template, jsonify, request, redirect, url_for, session
from supabase import create_client
import os

# Configuração do Supabase
supabase_url = 'https://gccxbkoejigwkqwyvcav.supabase.co'
supabase_key = os.getenv('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjY3hia29lamlnd2txd3l2Y2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2OTg5OTYsImV4cCI6MjA0OTI3NDk5Nn0.ADRY3SLagP-NjhAAvRRP8A4Ogvo7AbWvcW-J5gAbyr4')
supabase = create_client(supabase_url, supabase_key)

# Definição do Blueprint para rotas de relatórios
relatorios_bp = Blueprint('relatorios', __name__)

# Middleware para validação de login
def verificar_login():
    """
    Verifica se o usuário está logado.
    Redireciona para a página de login caso os dados de sessão estejam ausentes.
    """
    if 'user_id' not in session or 'empresa_id' not in session:
        return redirect(url_for('login.login'))  # Redireciona para o login se não estiver autenticado
    return None

@relatorios_bp.route('/relatorios', methods=['GET'])
def relatorios():
    redirecionar = verificar_login()
    if redirecionar:
        return redirecionar

    empresa_id = session.get('empresa_id')
    if not empresa_id:
        return jsonify({"erro": "Empresa não identificada na sessão."}), 403

    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim')
    usuario_id_filtro = request.args.get('usuario_id')
    meio_pagamento_filtro = request.args.get('meio_pagamento')

    try:
        query_agenda = supabase.table('agenda').select("*").eq('status', 'finalizado').eq('id_empresa', empresa_id)
        if data_inicio:
            query_agenda = query_agenda.gte('data', data_inicio)
        if data_fim:
            query_agenda = query_agenda.lte('data', data_fim)

        agenda_response = query_agenda.execute()
        if not agenda_response.data:
            return 
        
        agenda = agenda_response.data

        query_finalizados = supabase.table('finalizados').select("*").eq('id_empresa', empresa_id)
        if meio_pagamento_filtro:
            query_finalizados = query_finalizados.eq('meio_pagamento', meio_pagamento_filtro)

        finalizados_response = query_finalizados.execute()
        if not finalizados_response.data:
            return jsonify({"erro": "Nenhum dado encontrado na tabela 'finalizados'."}), 404

        finalizados = finalizados_response.data

        usuarios_response = supabase.table('usuarios').select("id, nome_usuario").eq('id_empresa', empresa_id).execute()
        if not usuarios_response.data:
            return jsonify({"erro": "Nenhum usuário encontrado na tabela 'usuarios'."}), 404

        usuarios = {u['id']: u['nome_usuario'] for u in usuarios_response.data}

        financeiro = {}
        atendimentos_por_usuario = {}
        financeiro_usuario = {}

        for agendamento in agenda:
            finalizados_agendamento = [f for f in finalizados if f['id_agenda'] == agendamento['id']]
            if not finalizados_agendamento:
                continue

            usuario_id = agendamento.get('usuario_id')
            if usuario_id_filtro and usuario_id_filtro != str(usuario_id):
                continue

            usuario = usuarios.get(usuario_id, "Usuário não encontrado")

            for finalizado in finalizados_agendamento:
                meio_pagamento = finalizado.get('meio_pagamento', "Não especificado")
                valor = finalizado.get('valor', 0)
                try:
                    valor = float(valor)
                except (ValueError, TypeError):
                    valor = 0

                if meio_pagamento not in financeiro:
                    financeiro[meio_pagamento] = 0
                financeiro[meio_pagamento] += valor

                if usuario not in financeiro_usuario:
                    financeiro_usuario[usuario] = 0
                financeiro_usuario[usuario] += valor

            if usuario not in atendimentos_por_usuario:
                atendimentos_por_usuario[usuario] = 0
            atendimentos_por_usuario[usuario] += 1

        return render_template(
            'relatorios.html',
            financeiro=financeiro,
            atendimentos=atendimentos_por_usuario,
            financeiro_usuario=financeiro_usuario,  # Inclui dados de financeiro por usuário
            filtros={
                'data_inicio': data_inicio,
                'data_fim': data_fim,
                'usuario_id': usuario_id_filtro,
                'meio_pagamento': meio_pagamento_filtro
            }
        )
    except Exception as e:
        print("Erro no processamento:", str(e))
        return jsonify({"erro": str(e)}), 500

@relatorios_bp.route('/listar_usuarios', methods=['GET'])
def listar_usuarios():
    redirecionar = verificar_login()
    if redirecionar:
        return redirecionar

    empresa_id = session.get('empresa_id')
    if not empresa_id:
        return jsonify({"erro": "Empresa não identificada na sessão."}), 403

    try:
        response = supabase.table("usuarios").select("id, nome_usuario").eq("id_empresa", empresa_id).execute()
        return jsonify(response.data), 200
    except Exception as e:
        print("Erro ao listar usuários:", str(e))
        return jsonify({"erro": str(e)}), 500
