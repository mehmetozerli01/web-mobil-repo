import { StyleSheet } from "react-native";

export const style = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'#FFFFFF',
        padding:20,
        justifyContent:'center',
    },
    title:{
        fontSize:32,
        fontWeight:'bold',
        color:'#333333',
        marginBottom:30,
        textAlign:'center',
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    forgotPassword: {
        color: '#007AFF',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    errorText: {
        color: '#FF3B30',
        textAlign: 'center',
        marginTop: 10,
        fontSize: 14,
    },
    successText: {
        color: '#34C759',
        textAlign: 'center',
        marginTop: 10,
        fontSize: 14,
    },
});