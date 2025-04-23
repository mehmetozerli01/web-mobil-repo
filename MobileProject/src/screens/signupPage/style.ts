import { StyleSheet } from "react-native";

export const style = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'#f2f2',
        alignItems:'center',
        justifyContent:'center',
        paddingHorizontal:30,
    },
    title:{
        fontSize:32,
        fontWeight:'bold',
        color:'#333',
        marginBottom:40,
    },
    input: {
        width:'100%',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 60,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
      },
      forgotPassword: {
        color: '#007AFF',
        marginTop: 20,
        textDecorationLine: 'underline',
      },



})