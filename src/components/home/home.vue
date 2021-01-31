<template>
    <div>
        <div>
            <el-row>
                <el-col :span="20">
                    <el-input v-model="roomid" placeholder="请输入房间号"></el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="connect">连接</el-button>
                </el-col>
            </el-row>
        </div>
        <div> 人气值：{{ popularity }} </div>
        <div v-html="display"> </div>
    </div>
</template>

<script>
import home from './home';

export default home;
</script>
