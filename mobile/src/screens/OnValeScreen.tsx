import React from 'react';
import { Linking, Alert, Image, View } from 'react-native';
import { MainContainer } from '../components/MainContainer';
import { ActionButton } from '../components/ActionButton'; // O novo componente
import { Phone, Mail, MapPin, ExternalLink, Instagram, Youtube } from 'lucide-react-native';

export const OnValeScreen: React.FC = () => {

  const openExternalLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Erro', `Não foi possível abrir este link: ${url}`);
    }
  };

  const openWhatsApp = (phone: string) => {
    openExternalLink(`https://wa.me/55${phone}`);
  };

  const openEmail = (email: string) => {
    openExternalLink(`mailto:${email}`);
  };

  return (
    <MainContainer>
      <View className="p-4 bg-white rounded-lg shadow mb-6 w-full max-w-2xl mx-auto">
        
        <View className="flex-col justify-center items-center gap-3 mb-5">
          <Image 
            source={require('../assets/onvalecontabilidade.png')} 
            resizeMode="contain"
            style={{ width: 300, height: 100 }}
          />
        </View>

        <ActionButton
          title="WhatsApp (12) 98204-4681"
          description="Clique para iniciar uma conversa"
          icon={<Phone size={22} color="#b91c1c" />}
          onPress={() => openWhatsApp('12982044681')}
        />

        <ActionButton
          title="E-mail (contato@onvale.com.br)"
          description="Clique para enviar um e-mail"
          icon={<Mail size={22} color="#b91c1c" />}
          onPress={() => openEmail('contato@onvale.com.br')}
        />

        <ActionButton
          title="Endereço"
          description="Av. Brasil, 338 - Sala 3 - Monte Castelo, SJC"
          icon={<MapPin size={22} color="#b91c1c" />}
          onPress={() => openExternalLink('https://www.google.com/maps/place/OnVale+Contabilidade/@-23.1824035,-45.8738706,21z/data=!4m6!3m5!1s0x94cc4bebee442563:0x478ea0740fea08e9!8m2!3d-23.1822569!4d-45.873974!16s%2Fg%2F11s892w3vc?entry=ttu&g_ep=EgoyMDI1MTEwNS4wIKXMDSoASAFQAw%3D%3D')}
        />

        <ActionButton
          title="Acessar o Site"
          description="onvale.com.br"
          icon={<ExternalLink size={22} color="#b91c1c" />}
          onPress={() => openExternalLink('https://onvale.com.br')}
        />

        <ActionButton
          title="Instagram"
          description="Clique para acessar nosso instagram"
          icon={<Instagram size={22} color="#b91c1c" />}
          onPress={() => openExternalLink('https://www.instagram.com/onvale_contabilidade/')}
        />

        <ActionButton
          title="Youtube"
          description="Clique para acessar nosso canal no Youtube"
          icon={<Youtube size={22} color="#b91c1c" />}
          onPress={() => openExternalLink('https://www.youtube.com/@OnvaleContabilidade')}
        />

      </View>
    </MainContainer>
  );
};