import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, Ionicons } from '../components/Icon';
import { useApp } from '../contexts/AppContext';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { useTheme } from '../contexts/ThemeContext';
import { hashSenha } from '../services/auth';
import { F, SHADOW } from '../constants/theme';

const ENDERECOS_INICIAIS = [
  { id: '1', label: 'Casa', endereco: 'Rua das Acacias, 42 - Vassouras, RJ' },
  { id: '2', label: 'Trabalho', endereco: 'Av. Principal, 100 - Sala 302' },
];

function iniciais(nome) {
  const partes = String(nome || 'Foome').trim().split(/\s+/).filter(Boolean);
  return partes.slice(0, 2).map(parte => parte[0]?.toUpperCase()).join('') || 'F';
}

function AvatarPerfil({ C, nome, uri }) {
  if (uri) {
    return <Image source={{ uri }} style={[s.avatarImg, { borderColor: C.brand }]} />;
  }

  return (
    <View style={[s.avatarFallback, { backgroundColor: C.brandLight, borderColor: C.brandBorder }]}>
      <Text style={[s.avatarInitials, { color: C.brand }]}>{iniciais(nome)}</Text>
    </View>
  );
}

function ModalShell({ C, children, onClose, title, visible }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.modalOverlay}
      >
        <View style={[s.modalCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={s.modalHeader}>
            <Text style={[s.modalTitle, { color: C.ink }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={s.iconBtn}>
              <Feather name="x" size={20} color={C.ink3} />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function PerfilScreen({ navigation }) {
  const { usuario, atualizarUsuario, logout } = useApp();
  const { limpar } = useCarrinho();
  const { C, isDark, preferencia, reset, toggle } = useTheme();

  const [notifAtiva, setNotifAtiva] = useState(true);
  const [enderecos, setEnderecos] = useState(ENDERECOS_INICIAIS);
  const [modalDados, setModalDados] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [modalSenha, setModalSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [modalEndereco, setModalEndereco] = useState(false);
  const [enderecoEditando, setEnderecoEditando] = useState(null);
  const [enderecoLabel, setEnderecoLabel] = useState('');
  const [enderecoTexto, setEnderecoTexto] = useState('');

  function abrirDados() {
    setEditNome(usuario?.nome || '');
    setEditEmail(usuario?.email || '');
    setModalDados(true);
  }

  async function salvarDados() {
    const nome = editNome.trim();
    const email = editEmail.trim().toLowerCase();

    if (!nome || !email) {
      Alert.alert('Atenção', 'Preencha nome e e-mail.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('E-mail inválido', 'Informe um e-mail válido.');
      return;
    }

    await atualizarUsuario({ ...usuario, nome, email, atualizadoEm: new Date().toISOString() });
    setModalDados(false);
    Alert.alert('Pronto', 'Dados atualizados com sucesso.');
  }

  async function alterarSenha() {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (novaSenha.length < 6) {
      Alert.alert('Senha curta', 'A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      Alert.alert('Senhas diferentes', 'A confirmação precisa ser igual à nova senha.');
      return;
    }

    const hashAtual = await hashSenha(senhaAtual);
    const senhaConfere = usuario?.senhaHash
      ? hashAtual === usuario.senhaHash
      : senhaAtual === usuario?.senha;

    if (!senhaConfere) {
      Alert.alert('Senha incorreta', 'A senha atual não confere.');
      return;
    }

    const usuarioAtualizado = {
      ...usuario,
      senhaHash: await hashSenha(novaSenha),
      atualizadoEm: new Date().toISOString(),
    };
    delete usuarioAtualizado.senha;

    await atualizarUsuario(usuarioAtualizado);
    setModalSenha(false);
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
    Alert.alert('Sucesso', 'Senha alterada com sucesso.');
  }

  function abrirNovoEndereco() {
    setEnderecoEditando(null);
    setEnderecoLabel('');
    setEnderecoTexto('');
    setModalEndereco(true);
  }

  function abrirEditarEndereco(endereco) {
    setEnderecoEditando(endereco.id);
    setEnderecoLabel(endereco.label);
    setEnderecoTexto(endereco.endereco);
    setModalEndereco(true);
  }

  function salvarEndereco() {
    const label = enderecoLabel.trim();
    const endereco = enderecoTexto.trim();

    if (!label || !endereco) {
      Alert.alert('Atenção', 'Preencha nome e endereço.');
      return;
    }

    if (enderecoEditando) {
      setEnderecos(prev => prev.map(item => (
        item.id === enderecoEditando ? { ...item, label, endereco } : item
      )));
    } else {
      setEnderecos(prev => [...prev, { id: Date.now().toString(), label, endereco }]);
    }

    setModalEndereco(false);
    setEnderecoEditando(null);
    setEnderecoLabel('');
    setEnderecoTexto('');
  }

  async function handleLogout() {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            limpar();
            await logout();
          },
        },
      ],
    );
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.surface} />

      <View style={[s.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => navigation.navigate('HomeTab')} style={[s.headerBtn, { backgroundColor: C.bg, borderColor: C.border }]}>
          <Feather name="arrow-left" size={20} color={C.ink} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: C.ink }]}>Perfil</Text>
        <TouchableOpacity onPress={abrirDados} style={[s.headerBtn, { backgroundColor: C.bg, borderColor: C.border }]}>
          <Feather name="edit-2" size={18} color={C.brand} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={[s.profileCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={s.avatarWrap}>
            <AvatarPerfil C={C} nome={usuario?.nome} uri={usuario?.fotoUri} />
            <TouchableOpacity
              style={[s.avatarEdit, { backgroundColor: C.brand, borderColor: C.surface }]}
              onPress={() => navigation.navigate('Cadastro')}
              activeOpacity={0.85}
            >
              <Feather name="camera" size={15} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={[s.nome, { color: C.ink }]}>{usuario?.nome || 'Usuário Foome'}</Text>
          <Text style={[s.email, { color: C.ink3 }]}>{usuario?.email || 'sem e-mail'}</Text>
          <TouchableOpacity
            onPress={abrirDados}
            style={[s.editDadosBtn, { backgroundColor: C.brandLight, borderColor: C.brandBorder }]}
          >
            <Feather name="user" size={15} color={C.brand} />
            <Text style={[s.editDadosTxt, { color: C.brand }]}>Editar dados</Text>
          </TouchableOpacity>
        </View>

        <Text style={[s.sectionLabel, { color: C.ink }]}>Preferências</Text>
        <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={s.row}>
            <View style={s.rowLeft}>
              <View style={[s.rowIcon, { backgroundColor: C.bg, borderColor: C.border }]}>
                <Feather name="moon" size={18} color={isDark ? C.amber : C.ink2} />
              </View>
              <View style={s.rowText}>
                <Text style={[s.rowLabel, { color: C.ink }]}>Modo escuro</Text>
                <Text style={[s.rowSub, { color: C.ink3 }]}>
                  {preferencia === 'system' ? 'Sistema' : isDark ? 'Ligado' : 'Desligado'}
                </Text>
              </View>
            </View>
            <View style={s.rowActions}>
              <TouchableOpacity
                onPress={reset}
                style={[s.smallChip, { borderColor: C.border, backgroundColor: C.bg }]}
              >
                <Text style={[s.smallChipTxt, { color: C.ink2 }]}>Sistema</Text>
              </TouchableOpacity>
              <Switch
                value={isDark}
                onValueChange={toggle}
                trackColor={{ false: C.border, true: C.brandLight }}
                thumbColor={isDark ? C.brand : C.ink4}
              />
            </View>
          </View>

          <View style={[s.divider, { backgroundColor: C.border }]} />

          <View style={s.row}>
            <View style={s.rowLeft}>
              <View style={[s.rowIcon, { backgroundColor: C.bg, borderColor: C.border }]}>
                <Feather name="bell" size={18} color={C.ink2} />
              </View>
              <View style={s.rowText}>
                <Text style={[s.rowLabel, { color: C.ink }]}>Notificações</Text>
                <Text style={[s.rowSub, { color: C.ink3 }]}>{notifAtiva ? 'Ativas' : 'Pausadas'}</Text>
              </View>
            </View>
            <Switch
              value={notifAtiva}
              onValueChange={setNotifAtiva}
              trackColor={{ false: C.border, true: C.brandLight }}
              thumbColor={notifAtiva ? C.brand : C.ink4}
            />
          </View>
        </View>

        <Text style={[s.sectionLabel, { color: C.ink }]}>Endereços salvos</Text>
        <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          {enderecos.map((endereco, index) => (
            <View key={endereco.id}>
              <View style={s.addressRow}>
                <View style={s.rowLeft}>
                  <View style={[s.rowIcon, { backgroundColor: C.bg, borderColor: C.border }]}>
                    <Feather
                      name={endereco.label.toLowerCase().includes('casa') ? 'home' : 'map-pin'}
                      size={18}
                      color={C.ink2}
                    />
                  </View>
                  <View style={s.rowText}>
                    <Text style={[s.rowLabel, { color: C.ink }]}>{endereco.label}</Text>
                    <Text style={[s.rowSub, { color: C.ink3 }]}>{endereco.endereco}</Text>
                  </View>
                </View>
                <View style={s.addressActions}>
                  <TouchableOpacity onPress={() => abrirEditarEndereco(endereco)} style={s.iconBtn}>
                    <Feather name="edit-2" size={16} color={C.ink3} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setEnderecos(prev => prev.filter(item => item.id !== endereco.id))}
                    style={s.iconBtn}
                  >
                    <Feather name="trash-2" size={16} color={C.brand} />
                  </TouchableOpacity>
                </View>
              </View>
              {index < enderecos.length - 1 && <View style={[s.divider, { backgroundColor: C.border }]} />}
            </View>
          ))}

          {enderecos.length === 0 && (
            <View style={s.emptyBox}>
              <Feather name="map-pin" size={24} color={C.ink4} />
              <Text style={[s.emptyTxt, { color: C.ink3 }]}>Nenhum endereço salvo</Text>
            </View>
          )}

          <TouchableOpacity
            style={[s.addRow, { borderTopColor: C.border }]}
            onPress={abrirNovoEndereco}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={18} color={C.brand} />
            <Text style={[s.addTxt, { color: C.brand }]}>Adicionar endereço</Text>
          </TouchableOpacity>
        </View>

        <Text style={[s.sectionLabel, { color: C.ink }]}>Segurança</Text>
        <TouchableOpacity
          style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}
          onPress={() => setModalSenha(true)}
          activeOpacity={0.85}
        >
          <View style={s.row}>
            <View style={s.rowLeft}>
              <View style={[s.rowIcon, { backgroundColor: C.bg, borderColor: C.border }]}>
                <Feather name="lock" size={18} color={C.ink2} />
              </View>
              <View style={s.rowText}>
                <Text style={[s.rowLabel, { color: C.ink }]}>Alterar senha</Text>
                <Text style={[s.rowSub, { color: C.ink3 }]}>Validação local com hash</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={C.ink4} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.logoutBtn, { backgroundColor: C.surface, borderColor: C.brandBorder }]}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Feather name="log-out" size={18} color={C.brand} />
          <Text style={[s.logoutTxt, { color: C.brand }]}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>

      <ModalShell C={C} visible={modalDados} title="Editar dados" onClose={() => setModalDados(false)}>
        <Text style={[s.inputLabel, { color: C.ink3 }]}>NOME</Text>
        <TextInput
          style={[s.input, { backgroundColor: C.bg, borderColor: C.border, color: C.ink }]}
          placeholder="Seu nome"
          placeholderTextColor={C.ink4}
          value={editNome}
          onChangeText={setEditNome}
        />
        <Text style={[s.inputLabel, { color: C.ink3 }]}>E-MAIL</Text>
        <TextInput
          style={[s.input, { backgroundColor: C.bg, borderColor: C.border, color: C.ink }]}
          placeholder="seu@email.com"
          placeholderTextColor={C.ink4}
          keyboardType="email-address"
          autoCapitalize="none"
          value={editEmail}
          onChangeText={setEditEmail}
        />
        <TouchableOpacity style={[s.modalPrimary, { backgroundColor: C.brand }]} onPress={salvarDados}>
          <Text style={s.modalPrimaryTxt}>Salvar alterações</Text>
        </TouchableOpacity>
      </ModalShell>

      <ModalShell C={C} visible={modalSenha} title="Alterar senha" onClose={() => setModalSenha(false)}>
        <Text style={[s.inputLabel, { color: C.ink3 }]}>SENHA ATUAL</Text>
        <TextInput
          style={[s.input, { backgroundColor: C.bg, borderColor: C.border, color: C.ink }]}
          placeholder="Senha atual"
          placeholderTextColor={C.ink4}
          secureTextEntry
          value={senhaAtual}
          onChangeText={setSenhaAtual}
        />
        <Text style={[s.inputLabel, { color: C.ink3 }]}>NOVA SENHA</Text>
        <TextInput
          style={[s.input, { backgroundColor: C.bg, borderColor: C.border, color: C.ink }]}
          placeholder="Mínimo 6 caracteres"
          placeholderTextColor={C.ink4}
          secureTextEntry
          value={novaSenha}
          onChangeText={setNovaSenha}
        />
        <Text style={[s.inputLabel, { color: C.ink3 }]}>CONFIRMAR NOVA SENHA</Text>
        <TextInput
          style={[s.input, { backgroundColor: C.bg, borderColor: C.border, color: C.ink }]}
          placeholder="Repita a nova senha"
          placeholderTextColor={C.ink4}
          secureTextEntry
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />
        <TouchableOpacity style={[s.modalPrimary, { backgroundColor: C.brand }]} onPress={alterarSenha}>
          <Text style={s.modalPrimaryTxt}>Salvar nova senha</Text>
        </TouchableOpacity>
      </ModalShell>

      <ModalShell
        C={C}
        visible={modalEndereco}
        title={enderecoEditando ? 'Editar endereço' : 'Novo endereço'}
        onClose={() => setModalEndereco(false)}
      >
        <Text style={[s.inputLabel, { color: C.ink3 }]}>NOME</Text>
        <TextInput
          style={[s.input, { backgroundColor: C.bg, borderColor: C.border, color: C.ink }]}
          placeholder="Casa, trabalho..."
          placeholderTextColor={C.ink4}
          value={enderecoLabel}
          onChangeText={setEnderecoLabel}
        />
        <Text style={[s.inputLabel, { color: C.ink3 }]}>ENDEREÇO</Text>
        <TextInput
          style={[s.input, s.inputMultiline, { backgroundColor: C.bg, borderColor: C.border, color: C.ink }]}
          placeholder="Rua, número, bairro e cidade"
          placeholderTextColor={C.ink4}
          multiline
          textAlignVertical="top"
          value={enderecoTexto}
          onChangeText={setEnderecoTexto}
        />
        <TouchableOpacity style={[s.modalPrimary, { backgroundColor: C.brand }]} onPress={salvarEndereco}>
          <Text style={s.modalPrimaryTxt}>Salvar endereço</Text>
        </TouchableOpacity>
      </ModalShell>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: { fontFamily: F.headingLg, fontSize: 24, letterSpacing: -0.6 },
  scroll: { padding: 16, paddingBottom: 42 },
  profileCard: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
    marginBottom: 22,
    ...SHADOW.card,
  },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatarImg: { width: 104, height: 104, borderRadius: 52, borderWidth: 3 },
  avatarFallback: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontFamily: F.headingLg, fontSize: 32 },
  avatarEdit: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nome: { fontFamily: F.headingLg, fontSize: 24, letterSpacing: -0.6, textAlign: 'center' },
  email: { fontFamily: F.regular, fontSize: 14, marginTop: 4, textAlign: 'center' },
  editDadosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
  },
  editDadosTxt: { fontFamily: F.semibold, fontSize: 14 },
  sectionLabel: {
    fontFamily: F.heading,
    fontSize: 16,
    letterSpacing: -0.2,
    marginBottom: 10,
    marginLeft: 2,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 22,
    ...SHADOW.card,
  },
  row: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  addressRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, minWidth: 0 },
  rowLabel: { fontFamily: F.semibold, fontSize: 15 },
  rowSub: { fontFamily: F.regular, fontSize: 12, marginTop: 3, lineHeight: 17 },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addressActions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallChip: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  smallChipTxt: { fontFamily: F.semibold, fontSize: 12 },
  divider: { height: 1, marginVertical: 12 },
  emptyBox: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptyTxt: { fontFamily: F.regular, fontSize: 13 },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 14,
    marginTop: 2,
    borderTopWidth: 1,
  },
  addTxt: { fontFamily: F.heading, fontSize: 14 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    height: 52,
    marginTop: 2,
    ...SHADOW.card,
  },
  logoutTxt: { fontFamily: F.heading, fontSize: 15 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 38 : 24,
    ...SHADOW.sheet,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  modalTitle: { fontFamily: F.headingLg, fontSize: 21, letterSpacing: -0.4 },
  inputLabel: {
    fontFamily: F.semibold,
    fontSize: 10,
    letterSpacing: 1.1,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: F.regular,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 92,
    paddingTop: 13,
    lineHeight: 20,
  },
  modalPrimary: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    ...SHADOW.float,
  },
  modalPrimaryTxt: { fontFamily: F.heading, fontSize: 16, color: '#fff' },
});
